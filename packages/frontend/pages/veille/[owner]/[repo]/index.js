import React from "react";
import fetch from "isomorphic-unfetch";
import Link from "next/link";

const getUrl = (source, textId, type, data) => {
  if (source === "LEGI" && type === "article") {
    return `https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=${data.id}&cidTexte=${textId}`;
  } else if (source === "LEGI" && type === "section") {
    return `https://www.legifrance.gouv.fr/affichCode.do?idSectionTA=${data.id}&cidTexte=${textId}`;
  } else if (source === "KALI" && type === "article") {
    return `https://www.legifrance.gouv.fr/affichIDCCArticle.do?idArticle=${data.id}&cidTexte=${textId}`;
  } else if (source === "KALI" && type === "section") {
    return `https://www.legifrance.gouv.fr/affichIDCC.do?idSectionTA=${data.id}&idConvention=${textId}`; //&cidTexte=KALITEXT000023684822&
    //https://www.legifrance.gouv.fr/affichIDCC.do;jsessionid=4C69BD3C8DE893DE7A87A722EE815999.tplgfr43s_1?idConvention=${textId}&cidTexte=${data.id}`;
  }
};

const colors = {
  VIGUEUR: "success",
  ABROGE: "danger",
  MODIFIE: "warning",
  ABROGE_DIFF: "warning"
};

const getColorByTitle = title => colors[title] || "primary";

const Badge = ({ title }) => (
  <span
    className={`badge badge-${getColorByTitle(title)}`}
    style={{ marginRight: 10 }}
  >
    {title}
  </span>
);

const FileChangeDetail = ({ source, textId, type, data, previous }) => {
  const href = getUrl(source, textId, type, data);
  return (
    <div style={{ marginLeft: 20 }}>
      {type === "article" && (
        <div>
          <Badge title={data.etat} />
          <a href={href} target="_blank">
            Article {data.num}
          </a>
          {previous && previous.data.etat !== data.etat && (
            <span style={{ textAlign: "left" }}>
              Passage de <Badge title={previous.data.etat} /> à{" "}
              <Badge title={data.etat} />
            </span>
          )}
        </div>
      )}
      {type === "section" && (
        <div>
          <Badge title={data.etat} />
          <a href={href} target="_blank">
            Section {data.title}
          </a>
          {previous && previous.data.etat !== data.etat && (
            <span style={{ textAlign: "left" }}>
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

const getTextId = path => path.replace(/^data\/(.*)\.json$/, "$1");

const Page = ({ query, changes }) => {
  //console.log("query", query);
  //console.log("changes", changes);
  return (
    <div className="container">
      {changes.map(change => (
        <React.Fragment key={change.hash}>
          <h4>
            {change.source} - {frenchDate(change.date)}
          </h4>
          {change.files.map(file => {
            return (
              <React.Fragment key={file.path}>
                <h5>{file.title}</h5>
                <ul>
                  {file.changes.added.length ? (
                    <div style={{ marginTop: 20 }}>
                      <h6>Nouveaux ({file.changes.added.length})</h6>
                      {file.changes.added.map(f => (
                        <FileChangeDetail
                          textId={getTextId(file.path)}
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
                          textId={getTextId(file.path)}
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
                          textId={getTextId(file.path)}
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
  //console.log("query", query);
  const API_HOST = getApiUrl();
  const url = `${API_HOST}/git/${query.owner}/${query.repo}/latest`;
  //console.log("url", url);
  const changes = await fetch(url).then(r => r.json());
  //console.log("apiData", apiData);
  return { query, changes };
};

export default Page;
