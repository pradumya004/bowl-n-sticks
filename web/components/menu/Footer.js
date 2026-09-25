// Footer: itadakimasu sign-off, socials, and the cafe's basic rules (from DB).
export default function Footer({ cafe }) {
  const insta = cafe?.socials?.instagram;
  const zomato = cafe?.socials?.zomato;

  return (
    <footer className="foot">
      <div className="ita">いただきます Itadakimasu!</div>

      <p className="links">
        {insta && (
          <a href={`https://instagram.com/${insta}`} target="_blank" rel="noreferrer">
            @{insta}
          </a>
        )}
        {zomato && <> · Zomato {zomato}</>}
      </p>

      {cafe?.rules?.length > 0 && (
        <div className="rules">
          <h4>Some basic rules</h4>
          <ul>
            {cafe.rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="soon">more new dishes coming soon</p>
    </footer>
  );
}
