const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function HoursTable({ hours }) {
  return (
    <table className="hours-table">
      <tbody>
        {hours.map((row) => (
          <tr key={row.weekday}>
            <td>{WEEKDAY_LABELS[row.weekday]}</td>
            <td>
              {row.closed
                ? 'Closed'
                : `${formatMinutes(row.open_minute)} – ${formatMinutes(row.close_minute)}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
