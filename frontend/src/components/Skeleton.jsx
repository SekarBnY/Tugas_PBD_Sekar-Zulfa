// Komponen Skeleton - pengganti spinner yang lebih intuitif
// Memberikan persepsi kecepatan yang jauh lebih baik karena user
// melihat "bayangan" konten sebelum data sungguhan muncul.

const pulse = "animate-pulse bg-slate-200 rounded";

// Skeleton untuk satu baris tabel (5-6 kolom)
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className={`${pulse} h-3 w-full`} style={{ width: `${60 + Math.random() * 35}%` }} />
      </td>
    ))}
  </tr>
);

// Skeleton untuk seluruh tabel dengan N baris
export const TableSkeleton = ({ rows = 10, cols = 5 }) => (
  <tbody className="divide-y divide-slate-100">
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} cols={cols} />
    ))}
  </tbody>
);

// Skeleton untuk kartu statistik (angka besar di atas)
export const StatCardSkeleton = () => (
  <div className="bg-white/90 backdrop-blur-md shadow-sm border border-slate-200 rounded-xl flex items-center p-6 border-l-4 border-l-slate-200">
    <div className={`${pulse} w-12 h-12 rounded-lg mr-4`} />
    <div className="flex-1">
      <div className={`${pulse} h-3 w-24 mb-3`} />
      <div className={`${pulse} h-7 w-32`} />
    </div>
  </div>
);

// Skeleton untuk kartu departemen (grid card)
export const DeptCardSkeleton = () => (
  <div className="bg-white/90 backdrop-blur-md shadow-sm border border-slate-200 rounded-xl p-5">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-3">
        <div className={`${pulse} w-10 h-10 rounded-lg`} />
        <div className={`${pulse} h-4 w-28`} />
      </div>
      <div className={`${pulse} h-6 w-16 rounded-full`} />
    </div>
    <div className={`${pulse} h-14 w-full rounded-lg mb-4`} />
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div><div className={`${pulse} h-3 w-20 mb-2`} /><div className={`${pulse} h-5 w-28`} /></div>
      <div><div className={`${pulse} h-3 w-20 mb-2`} /><div className={`${pulse} h-5 w-28`} /></div>
    </div>
    <div className={`${pulse} h-8 w-full rounded-lg`} />
    <div className={`${pulse} h-10 w-full rounded-lg mt-3`} />
  </div>
);

// Skeleton untuk chart/grafik area
export const ChartSkeleton = ({ height = "h-64" }) => (
  <div className={`${pulse} w-full ${height} rounded-lg`} />
);

// Skeleton untuk item list "Sintesis Terakhir" di Dashboard
export const HireItemSkeleton = () => (
  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
    <div className="flex justify-between items-center mb-2">
      <div className={`${pulse} h-4 w-32`} />
      <div className={`${pulse} h-4 w-12 rounded`} />
    </div>
    <div className="flex justify-between items-center">
      <div className={`${pulse} h-3 w-24`} />
      <div className={`${pulse} h-3 w-20`} />
    </div>
  </div>
);
