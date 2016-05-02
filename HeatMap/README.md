# Expected data format

### Description
* The visualizations aggregates data points into cells. 
* Cells are laid out in rows and columns where each axis maps a different metric.
* Flat data can be aggregated into columns. 
* Data in each column is then aggregated again to produce rows. 
* **Hint:** d3.nest() is very useful to easily obtain this format. Use it first to aggregate the column values. Then iterate through each column and aggregate it's children. 
* **Note:** Some combinations of row and column aggregates do not exist (ex: for columns a,b,c with possible rows 1,2,3...the combination of a->1 may not exist. This will result in blank cells. This may need to be handled in the dataprep step depending on the solution).

### Format 
```
[0: {
    colAttr: [{ //Column value. 
        0: {
            key: "rowAttr", //Row value
            values: {
                aggVal: 0, // Any numerical values representing a sum/avg/etc of the aggregated values
                children: [{}] // Contains each raw data object that contribute to the aggregation
            }
        }
    }],
    key: "",
    values: {
        aggVal: 0, // Any numerical values representing a sum/avg/etc of the aggregated values
        children: [{}] // Contains each raw data object that contribute to the aggregation
    }
}]

```

