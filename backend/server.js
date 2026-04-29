const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
    console.log(`[PROC] ${req.method} ${req.url}`);
    next();
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
    try {
        const [nodeRows] = await db.query(`SELECT COUNT(DISTINCT emp_no) as totalNodes FROM dept_emp WHERE to_date = '9999-01-01'`);
        const [salaryRows] = await db.query(`SELECT AVG(salary) as averageYield FROM salaries WHERE to_date = '9999-01-01'`);
        const [managerRows] = await db.query(`SELECT COUNT(DISTINCT emp_no) as activeManagers FROM dept_manager WHERE to_date = '9999-01-01'`);
        const [unitRows] = await db.query(`SELECT COUNT(*) as totalUnits FROM departments`);

        res.json({
            status: 'success',
            data: {
                totalNodes: nodeRows[0].totalNodes,
                averageYield: salaryRows[0].averageYield ? parseFloat(salaryRows[0].averageYield) : 0,
                activeManagers: managerRows[0].activeManagers,
                totalUnits: unitRows[0].totalUnits
            }
        });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/latest-hires
app.get('/api/latest-hires', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.emp_no, e.first_name, e.last_name, DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hire_date, t.title
            FROM employees e
            LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
            ORDER BY e.hire_date DESC
            LIMIT 5
        `);
        res.json({ status: 'success', data: rows });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/charts/hiring
app.get('/api/charts/hiring', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT YEAR(hire_date) as year, COUNT(*) as count 
            FROM employees 
            GROUP BY YEAR(hire_date) 
            ORDER BY year ASC
        `);
        res.json({ status: 'success', data: rows });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/charts/departments
app.get('/api/charts/departments', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT d.dept_name as name, COUNT(de.emp_no) as value 
            FROM departments d 
            JOIN dept_emp de ON d.dept_no = de.dept_no 
            WHERE de.to_date = '9999-01-01' 
            GROUP BY d.dept_name
            ORDER BY value DESC
        `);
        res.json({ status: 'success', data: rows });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/charts/demographics
app.get('/api/charts/demographics', async (req, res) => {
    try {
        const [genderRows] = await db.query(`SELECT gender as name, COUNT(*) as value FROM employees GROUP BY gender`);
        const [ageRows] = await db.query(`
            SELECT CONCAT(FLOOR(YEAR(birth_date)/10)*10, 's') as name, COUNT(*) as value 
            FROM employees 
            GROUP BY name 
            ORDER BY name ASC
        `);
        res.json({ status: 'success', data: { gender: genderRows, age: ageRows } });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/employees
app.get('/api/employees', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const department = req.query.department || '';
    const classification = req.query.classification || '';
    const offset = (page - 1) * limit;

    let filterParams = [];
    let countQuery = `
        SELECT COUNT(DISTINCT e.emp_no) as total 
        FROM employees e
        JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
        JOIN departments d ON de.dept_no = d.dept_no
        LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
        WHERE 1=1
    `;
    let dataQuery = `
        SELECT 
            e.emp_no, e.first_name, e.last_name, e.gender, 
            DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hire_date,
            d.dept_name as department, t.title as classification, 
            s.salary as fiscal_yield 
        FROM employees e 
        JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
        JOIN departments d ON de.dept_no = d.dept_no
        LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01' 
        LEFT JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01' 
        WHERE 1=1
    `;

    if (department) {
        countQuery += ` AND d.dept_name LIKE ?`;
        dataQuery += ` AND d.dept_name LIKE ?`;
        filterParams.push(`%${department}%`);
    }
    if (classification) {
        countQuery += ` AND t.title LIKE ?`;
        dataQuery += ` AND t.title LIKE ?`;
        filterParams.push(`%${classification}%`);
    }

    dataQuery += ` ORDER BY e.emp_no ASC LIMIT ? OFFSET ?`;

    try {
        const [countRows] = await db.query(countQuery, filterParams);
        const total = countRows[0].total;

        const queryParams = [...filterParams, limit, offset];
        const [rows] = await db.query(dataQuery, queryParams);

        res.json({
            status: 'success',
            data: rows,
            pagination: {
                total, page, limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/employees/:id/history
app.get('/api/employees/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
        const [empRows] = await db.query(`SELECT emp_no, first_name, last_name, gender, DATE_FORMAT(birth_date, '%Y-%m-%d') as birth_date, DATE_FORMAT(hire_date, '%Y-%m-%d') as hire_date FROM employees WHERE emp_no = ?`, [id]);
        if (empRows.length === 0) return res.status(404).json({ error: 'Employee not found' });
        
        const [titles] = await db.query(`SELECT title, DATE_FORMAT(from_date, '%Y-%m-%d') as from_date, DATE_FORMAT(to_date, '%Y-%m-%d') as to_date FROM titles WHERE emp_no = ? ORDER BY from_date DESC`, [id]);
        const [salaries] = await db.query(`SELECT salary, DATE_FORMAT(from_date, '%Y-%m-%d') as from_date, DATE_FORMAT(to_date, '%Y-%m-%d') as to_date FROM salaries WHERE emp_no = ? ORDER BY from_date DESC`, [id]);

        res.json({
            status: 'success',
            data: {
                profile: empRows[0],
                titles,
                salaries
            }
        });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/units/capacity
app.get('/api/units/capacity', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                d.dept_no,
                d.dept_name as name, 
                COUNT(de.emp_no) as nodes, 
                SUM(s.salary) as total_budget,
                (SELECT CONCAT(e2.first_name, ' ', e2.last_name) FROM dept_manager dm2 JOIN employees e2 ON dm2.emp_no = e2.emp_no WHERE dm2.dept_no = d.dept_no AND dm2.to_date = '9999-01-01' LIMIT 1) as current_manager,
                (SELECT dm2.emp_no FROM dept_manager dm2 WHERE dm2.dept_no = d.dept_no AND dm2.to_date = '9999-01-01' LIMIT 1) as manager_id
            FROM departments d 
            JOIN dept_emp de ON d.dept_no = de.dept_no AND de.to_date = '9999-01-01'
            JOIN salaries s ON de.emp_no = s.emp_no AND s.to_date = '9999-01-01'
            GROUP BY d.dept_no, d.dept_name
            ORDER BY total_budget DESC
        `);
        
        const processedRows = rows.map(r => {
            const budget = parseFloat(r.total_budget);
            let status = 'Low';
            if (budget > 100000000) status = 'Critical';
            else if (budget > 50000000) status = 'High';
            else if (budget > 10000000) status = 'Medium';
            
            return {
                ...r,
                total_budget: budget,
                status
            };
        });

        res.json({ status: 'success', data: processedRows });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// [NEW] GET /api/departments/:dept_no
app.get('/api/departments/:dept_no', async (req, res) => {
    const { dept_no } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT 
                d.dept_no,
                d.dept_name as name, 
                COUNT(de.emp_no) as nodes, 
                SUM(s.salary) as total_budget,
                (SELECT CONCAT(e2.first_name, ' ', e2.last_name) FROM dept_manager dm2 JOIN employees e2 ON dm2.emp_no = e2.emp_no WHERE dm2.dept_no = d.dept_no AND dm2.to_date = '9999-01-01' LIMIT 1) as current_manager,
                (SELECT dm2.emp_no FROM dept_manager dm2 WHERE dm2.dept_no = d.dept_no AND dm2.to_date = '9999-01-01' LIMIT 1) as manager_id
            FROM departments d 
            LEFT JOIN dept_emp de ON d.dept_no = de.dept_no AND de.to_date = '9999-01-01'
            LEFT JOIN salaries s ON de.emp_no = s.emp_no AND s.to_date = '9999-01-01'
            WHERE d.dept_no = ?
            GROUP BY d.dept_no, d.dept_name
        `, [dept_no]);
        
        if (rows.length === 0) return res.status(404).json({ error: 'Department not found' });
        
        res.json({ status: 'success', data: rows[0] });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// [NEW] GET /api/departments/:dept_no/managers
app.get('/api/departments/:dept_no/managers', async (req, res) => {
    const { dept_no } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT 
                e.emp_no, 
                CONCAT(e.first_name, ' ', e.last_name) as full_name,
                DATE_FORMAT(dm.from_date, '%Y-%m-%d') as from_date,
                DATE_FORMAT(dm.to_date, '%Y-%m-%d') as to_date
            FROM dept_manager dm
            JOIN employees e ON dm.emp_no = e.emp_no
            WHERE dm.dept_no = ?
            ORDER BY dm.from_date DESC
        `, [dept_no]);
        
        res.json({ status: 'success', data: rows });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// [NEW] GET /api/departments/:dept_no/employees
app.get('/api/departments/:dept_no/employees', async (req, res) => {
    const { dept_no } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        const [countRows] = await db.query(`
            SELECT COUNT(DISTINCT e.emp_no) as total 
            FROM employees e
            JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
            WHERE de.dept_no = ?
        `, [dept_no]);
        const total = countRows[0].total;

        const [rows] = await db.query(`
            SELECT 
                e.emp_no, e.first_name, e.last_name, e.gender, 
                DATE_FORMAT(e.hire_date, '%Y-%m-%d') as hire_date,
                t.title as classification, 
                s.salary as fiscal_yield 
            FROM employees e 
            JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
            LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01' 
            LEFT JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01' 
            WHERE de.dept_no = ?
            ORDER BY e.emp_no ASC 
            LIMIT ? OFFSET ?
        `, [dept_no, limit, offset]);

        res.json({
            status: 'success',
            data: rows,
            pagination: {
                total, page, limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/financial/summary
app.get('/api/financial/summary', async (req, res) => {
    try {
        const [currentPayroll] = await db.query(`SELECT SUM(salary) as totalPayroll FROM salaries WHERE to_date = '9999-01-01'`);
        
        const [yearlySalaries] = await db.query(`
            SELECT YEAR(from_date) as yr, SUM(salary) as total 
            FROM salaries 
            GROUP BY yr 
            ORDER BY yr DESC 
            LIMIT 2
        `);
        
        let growthRate = "0.0%";
        if (yearlySalaries.length >= 2) {
            const currentTotal = parseFloat(yearlySalaries[0].total);
            const prevTotal = parseFloat(yearlySalaries[1].total);
            const rate = ((currentTotal - prevTotal) / prevTotal) * 100;
            growthRate = (rate >= 0 ? '+' : '') + rate.toFixed(1) + '%';
        }

        res.json({
            status: 'success',
            data: {
                totalPayroll: currentPayroll[0].totalPayroll ? parseFloat(currentPayroll[0].totalPayroll) : 0,
                growthRate: growthRate,
                balance: 150000000
            }
        });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/financial/audit
app.get('/api/financial/audit', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        const [rows] = await db.query(`
            SELECT 
                e.emp_no, 
                CONCAT(e.first_name, ' ', e.last_name) as full_name,
                t.title as classification,
                s.salary as annual_yield
            FROM salaries s
            JOIN employees e ON s.emp_no = e.emp_no
            LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
            WHERE s.to_date = '9999-01-01'
            ORDER BY s.salary DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        
        const [countRows] = await db.query(`SELECT COUNT(emp_no) as total FROM salaries WHERE to_date = '9999-01-01'`);
        
        res.json({ 
            status: 'success', 
            data: rows,
            pagination: {
                total: countRows[0].total,
                page,
                limit,
                totalPages: Math.ceil(countRows[0].total / limit)
            }
        });
    } catch (error) {
        console.error('[SQL_ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`[INFRASTRUKTUR_OPTIMAL] Sektor_A mendengarkan pada port ${PORT}`);
});
