import React from "react";
import fetch from "isomorphic-unfetch";
import {
  Card,
  CardBody,
  CardHeader,
  Jumbotron,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  Badge,
  Table
} from "reactstrap";
import classnames from "classnames";
import htmlText from "html-text";
import { Search } from "react-feather";
import Link from "next/link";

import Collapsible from "../../../../src/Collapsible";
import Diff from "../../../../src/Diff";

//
// legifrance article/section-level links
//
// textId is the related code (LEGITEXT) or the Convention content (KALITEXT)
// rootId is the upper container id so KALICONT for CCs
//
const getLegiFranceUrl = ({ source, textId, rootId, type, data }) => {
  if (source === "LEGI") {
    if (type === "article") {
      // article d'un code
      return `https://www.legifrance.gouv.fr/affichCodeArticle.do?idArticle=${data.id}&cidTexte=${textId}`;
    } else if (type === "section") {
      // section d'un code
      return `https://www.legifrance.gouv.fr/affichCode.do?idSectionTA=${data.id}&cidTexte=${textId}`;
    }
  }
  if (source === "KALI") {
    if (type === "article") {
      // article d'une CC ou teste annexe
      return `https://www.legifrance.gouv.fr/affichIDCCArticle.do?idArticle=${data.id}&cidTexte=${textId}`;
    } else if (type === "section") {
      // si section
      if (data.id.match(/^KALISCTA/)) {
        return `https://www.legifrance.gouv.fr/affichIDCC.do?idSectionTA=${
          data.id
        }&idConvention=${textId || rootId}`;
        // si texte attaché/annexe
      } else if (data.id.match(/^KALITEXT/)) {
        return `https://www.legifrance.gouv.fr/affichIDCC.do?cidTexte=${
          data.id
        }&idConvention=${textId || rootId}`;
      }
    }
  }
};

const colors = {
  VIGUEUR: "success",
  ABROGE: "danger",
  MODIFIE: "warning",
  ABROGE_DIFF: "warning"
};

const getColorByEtat = title => colors[title] || "primary";

const BadgeEtat = ({ etat, style }) => (
  <span className={`badge badge-${getColorByEtat(etat)}`} style={style}>
    {etat}
  </span>
);

const getParentSection = parents =>
  (parents && parents.length && (
    <span title={parents.join("\n")}>{parents[parents.length - 1]} &gt; </span>
  )) ||
  null;

const FileChangeDetail = ({
  source,
  textId,
  rootId,
  type,
  data,
  parents,
  previous
}) => {
  const href = getLegiFranceUrl({ source, textId, rootId, type, data });
  const textField = source === "LEGI" ? "texte" : "content";
  const content = htmlText(data[textField] || "").trim();
  const previousContent =
    previous && htmlText(previous.data[textField] || "").trim();
  return (
    <tr>
      <td width="100" align="center">
        <BadgeEtat etat={data.etat} />
      </td>
      <td>
        {type === "article" && (
          <React.Fragment>
            {getParentSection(parents)}
            <a href={href} rel="noopener noreferrer" target="_blank">
              Article {data.num}
            </a>
          </React.Fragment>
        )}
        {type === "section" && (
          <a href={href} rel="noopener noreferrer" target="_blank">
            {data.title}
          </a>
        )}
        {previous && previous.data.etat !== data.etat && (
          <div>
            Passage de <BadgeEtat etat={previous.data.etat} /> à{" "}
            <BadgeEtat etat={data.etat} />
          </div>
        )}
        {previous && content !== previousContent && (
          <Collapsible
            trigger={
              <div style={{ cursor: "pointer" }}>
                <Search
                  size={16}
                  style={{ marginRight: 5, verticalAlign: "middle" }}
                />
                Voir le diff
              </div>
            }
          >
            <Diff
              inputA={previousContent}
              inputB={content}
              type={"words"}
              style={{
                padding: 5,
                whiteSpace: "pre-line",
                border: "1px solid silver",
                background: "#fff",
                borderRadius: 3
              }}
            />
          </Collapsible>
        )}
      </td>
    </tr>
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

const ChangesGroup = ({ changes, label, renderChange }) =>
  changes.length ? (
    <React.Fragment>
      <thead>
        <tr>
          <th colSpan="2" className="h5" style={{ padding: "15px 5px" }}>
            {label} ({changes.length})
          </th>
        </tr>
      </thead>
      <tbody>{changes.map(renderChange)}</tbody>
    </React.Fragment>
  ) : null;

const ChangesTable = ({ changes, renderChange }) =>
  (changes && (
    <Table size="sm" striped>
      <ChangesGroup
        changes={changes.added}
        label="Nouveaux"
        renderChange={renderChange}
      />
      <ChangesGroup
        changes={changes.modified}
        label="Modifiés"
        renderChange={renderChange}
      />
      <ChangesGroup
        changes={changes.removed}
        renderChange={renderChange}
        label="Supprimés"
      />
    </Table>
  )) ||
  null;

const getLegiId = path =>
  path.replace(/^data\/((?:LEGITEXT|KALICONT)\d+)\.json/, "$1");

const getLegiFranceBaseUrl = (source, path) => {
  if (source === "LEGI") {
    return `https://www.legifrance.gouv.fr/affichCode.do?cidTexte=${getLegiId(
      path
    )}`;
  } else if (source === "KALI") {
    return `https://www.legifrance.gouv.fr/affichIDCC.do?idConvention=${getLegiId(
      path
    )}`;
  }
};

const getFicheSpUrl = (path, id) => {
  if (path.match(/associations/)) {
    return `https://www.service-public.fr/associations/vosdroits/${id}`;
  } else if (path.match(/particuliers/)) {
    return `https://www.service-public.fr/particuliers/vosdroits/${id}`;
  } else if (path.match(/entreprises/) || path.match(/professionnels/)) {
    return `https://www.service-public.fr/professionnels-entreprises/vosdroits/${id}`;
  }
};

const Tab = ({ label, repo, active }) => (
  <NavItem>
    <Link href="/veille/[owner]/[repo]" as={`/veille/socialgouv/${repo}`}>
      <a
        className={classnames({
          "nav-link": true,
          active
        })}
      >
        {label}
      </a>
    </Link>
  </NavItem>
);

const HashLink = ({ owner, repo, hash }) => (
  <a
    rel="noopener noreferrer"
    target="_blank"
    href={`https://github.com/${owner}/${repo}/commit/${hash}`}
  >
    <Badge color="light" style={{ color: "#888", fontSize: "0.5em" }}>
      {hash.slice(0, 8)}
    </Badge>
  </a>
);

const sortByKey = key => (a, b) => {
  if (a.data[key] > b.data[key]) return 1;
  if (a.data[key] < b.data[key]) return -1;
  return 0;
};

const sortChanges = changes => ({
  added: changes.added.sort(sortByKey("subject")),
  removed: changes.removed.sort(sortByKey("subject")),
  modified: changes.modified.sort(sortByKey("subject"))
});

const Page = ({ query, changes }) => {
  console.log("changes", changes);
  return (
    <div className="container">
      <Jumbotron style={{ padding: 30 }}>
        <h1 className="display-3">Suivi des modifications</h1>
      </Jumbotron>
      <Nav tabs style={{ fontSize: "1.5em" }}>
        <Tab
          label="LEGI"
          repo="legi-data"
          active={query.repo === "legi-data"}
        />
        <Tab
          label="KALI"
          repo="kali-data"
          active={query.repo === "kali-data"}
        />
        <Tab
          label="Fiches SP"
          repo="fiches-vdd"
          active={query.repo === "fiches-vdd"}
        />
      </Nav>
      <TabContent>
        <TabPane>
          {changes.map(change => (
            <React.Fragment key={change.hash}>
              <h4 style={{ marginTop: 20 }}>
                Mise à jour du {frenchDate(change.date)}
                <HashLink
                  owner={query.owner}
                  repo={query.repo}
                  hash={change.hash}
                />
              </h4>
              {change.source === "FICHES-SP" && (
                <ChangesTable
                  source={change.source}
                  changes={sortChanges(change.changes)}
                  renderChange={change => (
                    <tr>
                      <td width="100" align="left">
                        {change.data.theme && (
                          <div className="text-muted">
                            {change.data.subject} | {change.data.theme}
                          </div>
                        )}
                        <a
                          target="_blank"
                          href={getFicheSpUrl(change.path, change.data.id)}
                          rel="noopener noreferrer"
                        >
                          {change.data.title}
                        </a>
                      </td>
                    </tr>
                  )}
                />
              )}
              {change.files.filter(hasChanges).map(file => (
                <Card key={file.path} style={{ marginBottom: 20 }}>
                  <CardHeader>
                    <a
                      rel="noopener noreferrer"
                      target="_blank"
                      href={getLegiFranceBaseUrl(change.source, file.path)}
                      style={{ color: "black" }}
                      className="h4"
                    >
                      {file.title}
                    </a>
                  </CardHeader>
                  <CardBody>
                    <ChangesTable
                      source={change.source}
                      changes={file.changes}
                      renderChange={change2 => (
                        <FileChangeDetail
                          source={change.source}
                          key={change2.path}
                          {...change2}
                        />
                      )}
                    />
                  </CardBody>
                </Card>
              ))}
            </React.Fragment>
          ))}
        </TabPane>
      </TabContent>
    </div>
  );
};

const getApiUrl = () =>
  typeof document !== "undefined" ? "/api" : "http://localhost:3000/api";

Page.getInitialProps = async ({ query }) => {
  const t = new Date();
  const API_HOST = getApiUrl();
  const url = `${API_HOST}/git/${query.owner}/${query.repo}/latest`;
  const changes = await fetch(url).then(r => r.json());
  const t2 = new Date();
  console.log("getInitialProps", t2 - t);
  return { query, changes };
};

export default Page;
