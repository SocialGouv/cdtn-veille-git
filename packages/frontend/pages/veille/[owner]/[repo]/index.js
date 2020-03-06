import React from "react";
import fetch from "isomorphic-unfetch";

const getUrl = (source, textId, rootId, type, data) => {
  if (source === "LEGI" && type === "article") {
    return `https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=${data.id}&cidTexte=${textId}`;
  } else if (source === "LEGI" && type === "section") {
    return `https://www.legifrance.gouv.fr/affichCode.do?idSectionTA=${data.id}&cidTexte=${textId}`;
  } else if (source === "KALI" && type === "article") {
    return `https://www.legifrance.gouv.fr/affichIDCCArticle.do?idArticle=${data.id}&cidTexte=${textId}`;
  } else if (source === "KALI" && type === "section") {
    if (data.id.match(/^KALISCTA/)) {
      return `https://www.legifrance.gouv.fr/affichIDCC.do?idSectionTA=${
        data.id
      }&idConvention=${textId || rootId}`;
    } else if (data.id.match(/^KALITEXT/)) {
      return `https://www.legifrance.gouv.fr/affichIDCC.do?cidTexte=${
        data.id
      }&idConvention=${textId || rootId}`;
    } //&cidTexte=KALITEXT000023684822&

    // https://www.legifrance.gouv.fr/affichIDCC.do?idConvention=KALICONT000005635624&cidTexte=KALITEXT000005678897
    //  https://www.legifrance.gouv.fr/affichIDCC.do?idArticle=KALIARTI000005849461&idSectionTA=KALISCTA000005723177&cidTexte=KALITEXT000005678899&idConvention=KALICONT000005635624&dateTexte=29990101

    //https://www.legifrance.gouv.fr/affichIDCC.do;jsessionid=4C69BD3C8DE893DE7A87A722EE815999.tplgfr43s_1?idConvention=${textId}&cidTexte=${data.id}`;
  }
};

//www.legifrance.gouv.fr/affichIDCCArticle.do?idArticle=KALIARTI000027909393&cidTexte=KALITEXT000020377916&dateTexte=29990101&categorieLien=id

const colors = {
  VIGUEUR: "success",
  ABROGE: "danger",
  MODIFIE: "warning",
  ABROGE_DIFF: "warning"
};

const getColorByTitle = title => colors[title] || "primary";

const Badge = ({ title, style }) => (
  <span className={`badge badge-${getColorByTitle(title)}`} style={style}>
    {title}
  </span>
);

const FileChangeDetail = ({ source, textId, rootId, type, data, previous }) => {
  const href = getUrl(source, textId, rootId, type, data);
  return (
    <div style={{ marginLeft: 20 }}>
      {type === "article" && (
        <div>
          <Badge title={data.etat} style={{ marginRight: 10 }} />
          <a href={href} target="_blank">
            Article {data.num}
          </a>
          {previous && previous.data.etat !== data.etat && (
            <span style={{ marginLeft: 10 }}>
              Passage de <Badge title={previous.data.etat} /> à{" "}
              <Badge title={data.etat} />
            </span>
          )}
        </div>
      )}
      {type === "section" && (
        <div>
          <Badge title={data.etat} style={{ marginRight: 10 }} />
          <a href={href} target="_blank">
            Section {data.title}
          </a>
          {previous && previous.data.etat !== data.etat && (
            <span style={{ marginLeft: 10 }}>
              Passage de <Badge title={previous.data.etat} /> à{" "}
              <Badge title={data.etat} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const frenchDate = str =>
  str
    .slice(0, 10)
    .split("-")
    .reverse()
    .join("/");

const hasChanges = file =>
  file.changes &&
  (file.changes.added.length > 0 ||
    file.changes.modified.length > 0 ||
    file.changes.removed.length > 0);

const Page = ({ query, changes }) => {
  //console.log("query", query);
  console.log("changes", changes);
  return (
    <div className="container">
      {changes.map(change => (
        <React.Fragment key={change.hash}>
          <h4>
            {change.source} - {frenchDate(change.date)}
          </h4>
          {change.files.filter(hasChanges).map(file => {
            return (
              <React.Fragment key={file.path}>
                <h5>{file.title}</h5>
                <ul>
                  {file.changes.added.length ? (
                    <div style={{ marginTop: 20 }}>
                      <h6>Nouveaux ({file.changes.added.length})</h6>
                      {file.changes.added.map(f => (
                        <FileChangeDetail
                          source={change.source}
                          key={f.id}
                          {...f}
                        />
                      ))}
                    </div>
                  ) : null}
                  {file.changes.removed.length ? (
                    <div style={{ marginTop: 20 }}>
                      <h6>Supprimés ({file.changes.removed.length})</h6>
                      {file.changes.removed.map(f => (
                        <FileChangeDetail
                          source={change.source}
                          key={f.id}
                          {...f}
                        />
                      ))}
                    </div>
                  ) : null}
                  {file.changes.modified.length ? (
                    <div style={{ marginTop: 20 }}>
                      <h6>Modifiés ({file.changes.modified.length})</h6>
                      {file.changes.modified.map(f => (
                        <FileChangeDetail
                          source={change.source}
                          key={f.id}
                          {...f}
                        />
                      ))}
                    </div>
                  ) : null}
                </ul>
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

const getApiUrl = () =>
  typeof document !== "undefined" ? "/api" : "http://localhost:3000/api";

Page.getInitialProps = async ({ query }) => {
  const API_HOST = getApiUrl();
  const url = `${API_HOST}/git/${query.owner}/${query.repo}/latest`;
  const changes = await fetch(url).then(r => r.json());
  return { query, changes };
};

export default Page;
