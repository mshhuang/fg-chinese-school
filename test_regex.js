const str = "$$_role:admin_$$ Hello world";
const match = str.match(/\$\$_role:\s*(.*?)\s*(?:_\$\$|\$\$)\s*(.*)/is);
console.log(match ? match[1] : "no match");
