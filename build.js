const babel=require('@babel/standalone'), fs=require('fs');
for(const f of process.argv.slice(2)){
  const code=fs.readFileSync('js/'+f+'.jsx','utf8');
  const out=babel.transform(code,{presets:['react'],filename:f+'.jsx'}).code;
  fs.writeFileSync('js/'+f+'.js',out); console.log(f, out.length);
}
