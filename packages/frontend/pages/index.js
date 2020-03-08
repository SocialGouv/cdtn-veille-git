import React from "react";
import Link from "next/link";
import { Jumbotron, Button } from "reactstrap";

const Home = () => (
  <div className="container">
    <Jumbotron style={{ marginTop: "15vh" }}>
      <h1>Suivi des modifications GIT</h1>
      <br />
      <br />
      <Link href="/veille/[owner]/[repo]" as="/veille/socialgouv/legi-data">
        <Button size="lg" color="primary">
          Accéder au suivi
        </Button>
      </Link>
    </Jumbotron>
  </div>
);

export default Home;
