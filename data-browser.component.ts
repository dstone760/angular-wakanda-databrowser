import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ds} from '../ds.service'
import {GridOptions} from "ag-grid";

@Component({
    selector: 'app-data-browser',
    templateUrl: './data-browser.component.html',
    styleUrls: ['./data-browser.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class DataBrowserComponent implements OnInit {
    compDS = [];
    selectedClass: any;
    queryString = "";
    gridOptions: GridOptions = <GridOptions>{};
    gridFlag = false;

    constructor() {

        //to see what the DS is doing, look at the readme file

        //I make a "new" ds by pushing to all of it to a new array
        //This is neccesary because the catalog from the wakanda javascript client is not iterable. So ngFor will not work with it.
        for (let key in ds) {
            this.compDS.push(ds[key]);
        }

        //using ag-grids infinite scroll mode: https://www.ag-grid.com/javascript-grid-infinite-scrolling/?framework=all#gsc.tab=0

        // tell grid we want virtual row model type
        this.gridOptions.rowModelType = 'infinite';
        // how big each page in our page cache will be, default is 100
        this.gridOptions.paginationPageSize = 100;
        // how many extra blank rows to display to the user at the end of the dataset,
        // which sets the vertical scroll and then allows the grid to request viewing more rows of data.
        // default is 1, ie show 1 row.
        this.gridOptions.paginationOverflowSize = 2;
        // how many server side requests to send at a time. if user is scrolling lots, then the requests
        // are throttled down
        this.gridOptions.maxConcurrentDatasourceRequests = 2;
        // how many pages to store in cache. default is undefined, which allows an infinite sized cache,
        // pages are never purged. this should be set for large data to stop your browser from getting
        // full of data
        this.gridOptions.maxPagesInCache = 2;


        this.selectClass(this.compDS[0]);

    }

    ngOnInit() {}

    setDataSource(){

        //again, this is all according to the infinite scroll mode. I structure the query around the params sent by ag-grid.

        let gridDataSource = {
            rowCount: null,
            getRows: (params) => {
                this.selectedClass.query({
                    filter: this.queryString,
                    pageSize: this.gridOptions.paginationPageSize,
                    start: params.startRow
                }).then((coll) => {

                    let lastRow = -1;

                    if (coll.entities.length < (params.endRow - params.startRow)) {
                        lastRow = coll.entities.length;
                    }

                    params.successCallback(coll.entities, lastRow);
                });

            }
        };


        this.gridOptions.datasource = gridDataSource;


        //okay, so, bare with me here.. I have an ngIf on my grid with gridFlag.
        //The grid MUST be re-rendered to use the new grid options.. but gridOptions.api is somehow not exposed for us
        //So, we just toggle the flag. But if we just do gridFlag=false;gridFlag=true;, it doesn't work
        //..but for some reason this does. ¯\_(ツ)_/¯
        this.gridFlag = false;
        setTimeout(() => {
            this.gridFlag = true;

        }, 0);
    }

    selectClass(sClass) {

        //this is where the wakanda stuff comes in

        this.selectedClass = sClass;

        //okay, so here, we want to get all, but WJS doesnt have an all() selector. so, I make the assumption that the first attribute is the key(it is for us)

        let key = this.selectedClass.attributes[0].name;

        //then set the query to get all entities where key>0(which is all of them)

        this.queryString = key + ">0";

        this.gridOptions.columnDefs = [];

        //then for the columns, we push all attributes into an array which are not relatedEntities or relatedEntity
        //if we let those attributes in, the value on the grid is [object Object].

        for (let attr in this.selectedClass.attributes) {
            let attribute = this.selectedClass.attributes[attr];
            if(attribute.kind !== "relatedEntities" && attribute.kind !== "relatedEntity"){
                //these columns come from ag-grid column definition.
                this.gridOptions.columnDefs.push({headerName: attribute.name, field: attribute.name, unSortIcon: true, width: 130})
            }

        }

        this.setDataSource();

    }



}
