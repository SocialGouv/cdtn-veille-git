import React from "react";
import fetch from "isomorphic-unfetch";
import {
  Card,
  CardBody,
  CardTitle,
  CardHeader,
  CardSubtitle,
  Jumbotron,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Badge,
  Button,
  CardText,
  Table,
  Row,
  Col
} from "reactstrap";
import classnames from "classnames";

import { Search } from "react-feather";
import Link from "next/link";

import Collapsible from "../../../../src/Collapsible";
import Diff from "../../../../src/Diff";

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
  const href = getUrl(source, textId, rootId, type, data);
  const textField = source === "LEGI" ? "texte" : "content";
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
        {previous && previous.data[textField] !== data[textField] && (
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
              inputA={data[textField]}
              inputB={previous.data[textField]}
              type={"words"}
              style={{
                padding: 5,
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

const ChangesGroup = ({ changes, source, label }) =>
  changes.length ? (
    <React.Fragment>
      <thead>
        <tr>
          <th colSpan="2" className="h5" style={{ padding: "15px 5px" }}>
            {label} ({changes.length})
          </th>
        </tr>
      </thead>
      <tbody>
        {changes.map(f => (
          <FileChangeDetail source={source} key={f.path} {...f} />
        ))}
      </tbody>
    </React.Fragment>
  ) : null;

const ChangesDetails = ({ source, changes }) =>
  (changes && (
    <Table size="sm" striped>
      {/*<thead>
      <tr>
        <th>#</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Username</th>
      </tr>
    </thead>*/}
      <ChangesGroup source={source} changes={changes.added} label="Nouveaux" />
      <ChangesGroup
        source={source}
        changes={changes.modified}
        label="Modifiés"
      />
      <ChangesGroup
        source={source}
        changes={changes.removed}
        label="Supprimés"
      />
    </Table>
  )) ||
  null;

const getLegiId = path =>
  path.replace(/^data\/((?:LEGITEXT|KALICONT)\d+)\.json/, "$1");

const getFileUrl = (source, path) => {
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

const Page = ({ query, changes }) => {
  //console.log("query", query);
  //console.log("changes", changes);
  return (
    <div className="container">
      <Jumbotron style={{ padding: 30 }}>
        <h1 className="display-3">Suivi des modifications</h1>
      </Jumbotron>
      <Nav tabs style={{ fontSize: "1.5em" }}>
        <NavItem>
          <Link href="/veille/[owner]/[repo]" as="/veille/socialgouv/legi-data">
            <a
              className={classnames({
                "nav-link": true,
                active: query.repo === "legi-data"
              })}
            >
              LEGI
            </a>
          </Link>
        </NavItem>
        <NavItem>
          <Link href="/veille/[owner]/[repo]" as="/veille/socialgouv/kali-data">
            <a
              className={classnames({
                "nav-link": true,
                active: query.repo === "kali-data"
              })}
            >
              KALI
            </a>
          </Link>
        </NavItem>
        <NavItem>
          <Link
            href="/veille/[owner]/[repo]"
            as="/veille/socialgouv/fiches-vdd"
          >
            <a
              className={classnames({
                "nav-link": true,
                active: query.repo === "fiches-vdd"
              })}
            >
              Fiches SP
            </a>
          </Link>
        </NavItem>
      </Nav>
      <TabContent>
        <TabPane>
          {changes.map(change => (
            <React.Fragment key={change.hash}>
              <h4 style={{ marginTop: 20 }}>
                Mise à jour du {frenchDate(change.date)}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href={`https://github.com/${query.owner}/${query.repo}/commit/${change.hash}`}
                >
                  <Badge
                    color="light"
                    style={{ color: "#888", fontSize: "0.5em" }}
                  >
                    {change.hash.slice(0, 8)}
                  </Badge>
                </a>
              </h4>
              {change.files.filter(hasChanges).map(file => (
                <Card key={file.path} style={{ marginBottom: 20 }}>
                  <CardHeader>
                    <a
                      rel="noopener noreferrer"
                      target="_blank"
                      href={getFileUrl(change.source, file.path)}
                      style={{ color: "black" }}
                      className="h4"
                    >
                      {file.title}
                    </a>
                  </CardHeader>
                  <CardBody>
                    <ChangesDetails
                      source={change.source}
                      changes={file.changes}
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
