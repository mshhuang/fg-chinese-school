const fs = require('fs');
let code = fs.readFileSync('src/components/PhotoCarousel.tsx', 'utf8');

code = code.replace(
  /export function PhotoCarousel\([^)]*\) \{/,
  `$&
  const { t } = useLanguage();`
);

fs.writeFileSync('src/components/PhotoCarousel.tsx', code);
