import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Jumbotron,
  ListGroup,
  ListGroupItem,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  Table,
  Row,
  Col
} from "reactstrap";
import classnames from "classnames";
import { Search } from "react-feather";
import Link from "next/link";
import { getLatestChanges, showCommit } from "@veille/git";

import repos from "../../../../../src/repos";
import { Collapsible } from "../../../../../src/Collapsible";
import { Diff } from "../../../../../src/Diff";
import { HashLink } from "../../../../../src/HashLink";

// exclude some heavy commits
const excludes = [
  "525243dc3684597cca1a05a6247860258594ebb7",
  "5e0278ee32ace78e43db4016460412983aeb00cf",
  "3c777aba29230d470b04eac9c4ba2d373001a3b2",
  "2937f0c11cdb92c81cdd933dbdf6c036ae64cc3b",
  "bc3722cb5cb73203014bc698b24a67d2e92f79a1",
  "a42e5a7d54f4e577b6b1cb5fc91584d9da549bee",
  "70c5007483abdc0d747bcde2554680e310b75748",
  "7b25b286f0d5854a2376c2b5c77cfda9c4c9a662"
];

const isExcluded = commit => excludes.includes(commit.hash);
const isNotExcluded = commit => !isExcluded(commit);

const MAX_PRERENDER_HISTORY = 15;

const sortByKey = key => (a, b) => {
  if (a.data[key] > b.data[key]) return 1;
  if (a.data[key] < b.data[key]) return -1;
  return 0;
};

//
// legifrance article/section-level links resolution
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
      if (data.id && data.id.match(/^KALISCTA/)) {
        return `https://www.legifrance.gouv.fr/affichIDCC.do?idSectionTA=${
          data.id
        }&idConvention=${textId || rootId}`;
        // si texte attaché/annexe
      } else if (data.id && data.id.match(/^KALITEXT/)) {
        return `https://www.legifrance.gouv.fr/affichIDCC.do?cidTexte=${
          data.id
        }&idConvention=${textId || rootId}`;
      }
    }
  }
};

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
  if (path && path.match(/associations/)) {
    return `https://www.service-public.fr/associations/vosdroits/${id}`;
  } else if (path && path.match(/particuliers/)) {
    return `https://www.service-public.fr/particuliers/vosdroits/${id}`;
  } else if (
    path &&
    (path.match(/entreprises/) || path.match(/professionnels/))
  ) {
    return `https://www.service-public.fr/professionnels-entreprises/vosdroits/${id}`;
  }
  return "#";
};

const frenchDate = str =>
  str &&
  str
    .slice(0, 10)
    .split("-")
    .reverse()
    .join("/");

const colors = {
  VIGUEUR: "info",
  VIGUEUR_ETEN: "success",
  ABROGE: "danger",
  PERIME: "danger",
  MODIFIE: "warning",
  REMPLACE: "warning",
  ABROGE_DIFF: "warning"
};

const getColorByEtat = title => colors[title] || "primary";

const BadgeEtat = ({ etat, style }) => (
  <span className={`badge badge-${getColorByEtat(etat)}`} style={style}>
    {etat}
  </span>
);

const getParentSections = (parents, maxCount = 3) => {
  if (parents && parents.length) {
    const maxParents =
      parents.length > maxCount ? Math.min(parents.length, maxCount) : 1;
    const slice = parents.slice(parents.length - maxParents, maxParents);
    if (slice.length) {
      return <span title={parents.join("\n")}>{slice.join(" > ")} &gt;</span>;
    }
  }
  return null;
};

const DilaFileChangeDetail = ({
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
  const content = data[textField] || "";
  const previousContent = previous && (previous.data[textField] || "");
  return (
    <tr>
      <td width="100" align="center">
        <BadgeEtat etat={data.etat} />
      </td>
      <td>
        {type === "article" && (
          <React.Fragment>
            {getParentSections(parents)}
            <a href={href} rel="noopener noreferrer" target="_blank">
              Article {data.num}
            </a>
          </React.Fragment>
        )}
        {type === "section" && (
          <React.Fragment>
            {getParentSections(parents)}
            <a href={href} rel="noopener noreferrer" target="_blank">
              {data.title}
            </a>
          </React.Fragment>
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
        label="Nouveaux"
        changes={changes.added}
        renderChange={renderChange}
      />
      <ChangesGroup
        label="Modifiés"
        changes={changes.modified}
        renderChange={renderChange}
      />
      <ChangesGroup
        label="Supprimés"
        changes={changes.removed}
        renderChange={renderChange}
      />
    </Table>
  )) ||
  null;

const Tab = ({ label, repo, active }) => (
  <NavItem>
    <Link
      prefetch={false}
      href="/veille/[owner]/[repo]"
      as={`/veille/socialgouv/${repo}`}
    >
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

const sortChanges = changes => ({
  added: changes.added.sort(sortByKey("subject")),
  removed: changes.removed.sort(sortByKey("subject")),
  modified: changes.modified.sort(sortByKey("subject"))
});

const Page = ({ query, commit, history }) => {
  if (!commit) {
    console.log("Page.render: no commit");
    return <div>no commit here</div>;
  }
  if (typeof window !== "undefined") {
    console.log("Page.render", { query, commit, history });
  }
  return (
    <div className="container-fluid">
      <Jumbotron style={{ padding: 30 }}>
        <h1 className="display-3">
          <Link href="/">
            <a>Suivi des modifications</a>
          </Link>
        </h1>
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
        <TabPane style={{ paddingTop: 10 }}>
          <Row>
            <Col xs={2}>
              <ListGroup>
                {history.map((commit, index) => (
                  <ListGroupItem
                    action
                    key={commit.hash}
                    active={
                      commit.hash === query.hash ||
                      ((query.hash === "latest" || !query.hash) && index === 0)
                    }
                  >
                    <Link
                      prefetch={false}
                      href={`/veille/[owner]/[repo]/commit/[hash]`}
                      as={`/veille/${query.owner}/${query.repo}/commit/${commit.hash}`}
                      passHref
                    >
                      <span style={{ cursor: "pointer" }}>
                        {frenchDate(commit.date)}
                      </span>
                    </Link>
                    <HashLink
                      className="float-right"
                      owner={query.owner}
                      repo={query.repo}
                      hash={commit.hash}
                    />
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Col>
            <Col xs={10}>
              <React.Fragment key={commit.hash}>
                {(commit.source === "FICHES-SP" && (
                  <ChangesTable
                    source={commit.source}
                    changes={sortChanges(commit.changes)}
                    renderChange={change =>
                      change && (
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
                      )
                    }
                  />
                )) ||
                  commit.files.filter(hasChanges).map(file => (
                    <Card key={file.path} style={{ marginBottom: 20 }}>
                      <CardHeader>
                        <a
                          rel="noopener noreferrer"
                          target="_blank"
                          href={getLegiFranceBaseUrl(commit.source, file.path)}
                          style={{ color: "black" }}
                          className="h4"
                        >
                          {file.title}
                        </a>
                      </CardHeader>
                      <CardBody>
                        <ChangesTable
                          source={commit.source}
                          changes={file.changes}
                          renderChange={change2 => (
                            <DilaFileChangeDetail
                              source={commit.source}
                              key={change2.path}
                              {...change2}
                            />
                          )}
                        />
                      </CardBody>
                    </Card>
                  ))}
              </React.Fragment>
            </Col>
          </Row>
        </TabPane>
      </TabContent>
    </div>
  );
};

//export const getInitialProps = async ({ req, res }) => {};

export const getStaticProps = async ({ params }) => {
  const { owner, repo, hash } = params;
  const repoPath = `${owner}/${repo}`;
  const repoConf = repos[repoPath];

  const t = new Date();

  const history = (
    await getLatestChanges({
      cloneDir: repoConf.cloneDir,
      filterPath: repoConf.filterPath
    })
  ).filter(isNotExcluded);

  const commitHash = hash || history[0].hash;

  const commit = await showCommit({
    cloneDir: repoConf.cloneDir,
    filterPath: repoConf.filterPath,
    hash: commitHash
  });

  const changes = await repoConf.processCommit(commit);

  const t2 = new Date();

  console.log("getStaticProps", t2 - t, `${repoPath}/${commitHash}`);

  const pageProps = {
    query: {
      ...params,
      hash: commitHash
    },
    commit: changes,
    history
  };

  return {
    props: pageProps
  };
};

export const getStaticPaths = async () => {
  // prerender pages based on git history
  const paths = (
    await Promise.all(
      Object.keys(repos).map(async key => {
        const history = await getLatestChanges({
          cloneDir: repos[key].cloneDir,
          filterPath: repos[key].filterPath
        });
        const [owner, repo] = key.split("/");
        return history
          .filter(isNotExcluded)
          .slice(0, MAX_PRERENDER_HISTORY)
          .map(commit => ({
            params: { owner, repo, hash: commit.hash }
          }));
      })
    )
  ).flat();
  return {
    paths,
    fallback: true
  };
};

export default Page;
