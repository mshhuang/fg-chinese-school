const content = "$$_role:teacher_$$<h2><strong style=\"color: rgb(0, 0, 0);\">Welcome&nbsp;to&nbsp;Week&nbsp;1!</strong></h2>";
const roleMatch = content.match(/\$\$_role:\s*(.*?)\s*(?:_\$\$|\$\$)\s*(.*)/is);
console.log(roleMatch);
