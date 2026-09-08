import React from 'react';

/**
 * Stitch Reusable Data Table Component
 * @param {Object} props
 * @param {Array<{ key: string, label: string, render?: (val: any, row: any) => React.ReactNode, align?: 'left' | 'center' | 'right' }>} props.columns
 * @param {Array<Object>} props.data
 * @param {string} [props.keyField='id']
 * @param {string} [props.emptyMessage='No records found.']
 * @param {string} [props.className]
 */
export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records found.',
  className = ''
}) {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-outline-variant/30 ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-low bg-surface-container-lowest">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-sm text-on-surface-variant"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row[keyField] || idx}
                className="hover:bg-surface-container-low/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3.5 px-4 text-sm text-on-surface ${
                      col.align === 'right'
                        ? 'text-right font-mono'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] !== undefined && row[col.key] !== null
                      ? String(row[col.key])
                      : '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
