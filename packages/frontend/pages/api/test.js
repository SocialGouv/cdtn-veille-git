import git from "@veille/git";

console.log("git", git);

export default (req, res) => res.json({ hello: "world" });
