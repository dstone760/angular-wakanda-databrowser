# angular-wakanda-databrowser
An angular component which displays the data in a wakanda server via the wakanda javascript client. Uses bootstrap and ag-grid as well. 

This repo is NOT supposed to be universal. I just wanted to share our solution for others to gain ideas about how to approach the problem of displaying wakanda data in angular 2. 

The HTML and CSS file are left uncommented since thats mostly just bootstrap and styling. I will include a screenshot of how the page looks on my end.

Quick note about my setup: youll notice in the ts file that I am importing "ds"
This is from my ds.service.ts file, which looks like 
```typescript
import { Injectable } from '@angular/core';
import {Wakanda} from './wakanda.service';

let ds:any;

@Injectable()
export class DsService {
  constructor(private wakanda : Wakanda) {}
  makeDS(){
    return this.wakanda.catalog.then((ds2:any)=>{
      ds = ds2;
      return true;
    })
  }

}

export {ds}
```
And we run makeDS() else where in the project. I have no idea if this is a good idea, but it releases us from the .then promise syntax, so thats pretty neat. Also, those return statements look a little weird, but we use them in a canActivate method for our angular routes, and it doesnt affect creating the ds in other contexts.

