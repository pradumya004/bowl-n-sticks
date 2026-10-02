// Footer: itadakimasu sign-off, where to find the place, socials, and the
// cafe's house rules. Every word here comes from the cafe row, editable at
// /admin/settings, so none of it is hard-coded.
export default function Footer({ cafe }) {
  const insta = cafe?.socials?.instagram;
  const zomato = cafe?.socials?.zomato;
  const swiggy = cafe?.socials?.swiggy;
  const hasVisit = cafe?.address || cafe?.timings || cafe?.phone;

  return (
    <footer className="foot">
      <div className="ita">いただきます Itadakimasu!</div>

      {hasVisit && (
        <div className="visit">
          {cafe.address && (
            <p className="visit-line">
              <span className="visit-key">Find us</span>
              {/* only linked when the owner has actually set a maps url */}
              {cafe.maps_url ? (
                <a href={cafe.maps_url} target="_blank" rel="noreferrer">
                  {cafe.address}
                </a>
              ) : (
                <span>{cafe.address}</span>
              )}
            </p>
          )}
          {cafe.timings && (
            <p className="visit-line">
              <span className="visit-key">Open</span>
              <span>{cafe.timings}</span>
            </p>
          )}
          {cafe.phone && (
            <p className="visit-line">
              <span className="visit-key">Call</span>
              {/* tel: so a tap on a phone dials instead of selecting text */}
              <a href={`tel:${cafe.phone.replace(/\s+/g, "")}`}>{cafe.phone}</a>
            </p>
          )}
        </div>
      )}

      <p className="links">
        {insta && (
          <a
            href={`https://instagram.com/${insta}`}
            target="_blank"
            rel="noreferrer"
          >
            @{insta}
          </a>
        )}
        {zomato && <> · Zomato {zomato}</>}
        {swiggy && <> · Swiggy {swiggy}</>}
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

      {/* Required: the chilli is Twemoji artwork, which is CC BY 4.0. */}
      <p className="credit">
        Chilli icon from{" "}
        <a
          href="https://github.com/twitter/twemoji"
          target="_blank"
          rel="noreferrer"
        >
          Twemoji
        </a>{" "}
        &copy; Twitter, Inc, CC BY 4.0
      </p>
    </footer>
  );
}
