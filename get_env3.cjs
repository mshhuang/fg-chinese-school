console.log(Object.keys(process.env).filter(k => k.includes('URL') || k.includes('DB') || k.includes('POSTGRES')));
