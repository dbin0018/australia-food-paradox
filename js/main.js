// SHARED VEGA-LITE CONFIG 
const vlConfig = {
  background: "transparent",
  font: "DM Sans",
  view: { stroke: "transparent" }
};

const embedOpts = {
  actions: false,
  renderer: "svg",
  config: vlConfig
};

// MAP 1: CHOROPLETH MAP 
const map1Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "height": 400,
  "projection": { "type": "mercator" },
  "data": {
    "url": "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson",
    "format": { "type": "json", "property": "features" }
  },
  "transform": [
    {
      "lookup": "properties.STATE_NAME",
      "from": {
        "data": { "url": "data/fastfood-locations.json" },
        "key": "state",
        "fields": ["enterprises", "enterprise_pct", "population_pct", "diff"]
      }
    }
  ],
  "mark": { "type": "geoshape", "stroke": "#c8bfaf", "strokeWidth": 0.8 },
  "encoding": {
    "color": {
      "field": "enterprise_pct",
      "type": "quantitative",
      "scale": { "range": ["#cfe2f3", "#1a3a5c"] },
      "legend": { "title": "Fast food outlets (%)" }
    },
    "tooltip": [
      { "field": "properties.STATE_NAME", "title": "State" },
      { "field": "enterprises", "title": "No. of outlets", "format": "," },
      { "field": "enterprise_pct", "title": "Share of outlets (%)", "format": ".1f" },
      { "field": "population_pct", "title": "Share of population (%)", "format": ".1f" }
    ]
  }
};

vegaEmbed("#map1", map1Spec, embedOpts);

// CHART 1: FAST FOOD REVENUE OVER TIME 
const chart1Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "height": 350,

  "title": {
  "text": "Fast Food Businesses Across Australia",
  "subtitle": "Share of total outlets by state and territory (2026)",
  "anchor": "start",
  "fontSize": 15,
  "subtitleFontSize": 11,
  "subtitleColor": "#7a7670",
  "fontWeight": "bold"},

  "data": { "url": "data/fastfood-revenue.json" },

  // three layers stacked on top of each other
  "layer": [

    // LAYER 1: shaded area under the full line
    // uses ALL data points to fill the area beneath
    {
      "mark": { "type": "area", "opacity": 0.08, "color": "#1a3a5c" },
      "encoding": {
        "x": { "field": "year", "type": "ordinal" },
        "y": { "field": "revenue", "type": "quantitative" }
      }
    },

    // LAYER 2: solid line for actual data only
    // filter to only "actual" rows using a transform
    {
      "transform": [ { "filter": "datum.type === 'actual'" } ],
      "mark": { "type": "line", "strokeWidth": 2.5, "color": "#1a3a5c" },
      "encoding": {
        "x": { "field": "year", "type": "ordinal" },
        "y": { "field": "revenue", "type": "quantitative" },
        "tooltip": [
          { "field": "year", "title": "Year" },
          { "field": "revenue", "title": "Revenue (A$M)", "format": ",.0f" }
        ]
      }
    },

    // LAYER 3: dashed line for forecast data only
    // strokeDash: [6, 3] is 6px dash, 3px gap
    {
      "transform": [ { "filter": "datum.type === 'forecast'" } ],
      "mark": { "type": "line", "strokeWidth": 2.5, "color": "#1a3a5c", "strokeDash": [6, 3] },
      "encoding": {
        "x": { "field": "year", "type": "ordinal" },
        "y": { "field": "revenue", "type": "quantitative" },
        "tooltip": [
          { "field": "year", "title": "Year (Forecast)" },
          { "field": "revenue", "title": "Revenue (A$M)", "format": ",.0f" }
        ]
      }
    },

    // LAYER 4: annotation label for the COVID dip
    // text mark manually positioned at 2019-20
    {
      "mark": {
        "type": "text",
        "align": "left",
        "dx": 6,
        "dy": -10,
        "fontSize": 11,
        "color": "#7a7670"
      },
      "encoding": {
        "x": { "field": "year", "type": "ordinal" },
        "y": { "field": "revenue", "type": "quantitative" },
        "text": { "value": "" },
        // Only show the label on the COVID dip year
        "condition": {
          "test": "datum.year === '2019-20'",
          "value": "COVID-19"
        }
      }
    }
  ],

  // Shared x and y axis config across all layers
  "encoding": {
    "x": {
      "field": "year",
      "type": "ordinal",
      "axis": {
        "title": null,
        "labelAngle": -45,
        "labelFontSize": 10
      }
    },
    "y": {
      "field": "revenue",
      "type": "quantitative",
      "axis": {
        "title": "Revenue (A$ million)",
        "titleFontSize": 11
      }
    }
  }
};

vegaEmbed("#chart1", chart1Spec, embedOpts);

// CHART 2: CHAIN MARKET SHARE 
const chart2Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "height": 280,
  "data": { "url": "data/fastfood-companies.json" },
  "mark": {
    "type": "bar",
    "cornerRadiusEnd": 4  // slightly rounded bar tips for cleaner looks
  },
  "encoding": {
    // y axis is the company name, sorted by share descending
    // biggest bar is always at the top
    "y": {
      "field": "company",
      "type": "nominal",
      "sort": "-x",
      "axis": { "title": null }
    },
    "x": {
      "field": "share",
      "type": "quantitative",
      "axis": { "title": "Market share (%)", "titleFontSize": 11 }
    },
    // highlight McDonald's differently since it dominates
    // condition checks if it's McDonald' (if yes, dark blue, if no, lighter blue)
    "color": {
      "condition": {
        "test": "datum.company === \"McDonald's\"",
        "value": "#1a3a5c"
      },
      "value": "#6a9cbf"
    },
    "tooltip": [
      { "field": "company", "title": "Company" },
      { "field": "share", "title": "Market share (%)", "format": ".1f" }
    ]
  }
};

vegaEmbed("#chart2", chart2Spec, embedOpts);

// CHART 3: DELIVERY PLATFORM REVENUE
const chart3Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "height": 350,
  "data": { "url": "data/delivery-revenue.json" },
  "layer": [
    {
      "transform": [ { "filter": "datum.type === 'actual'" } ],
      "mark": { "type": "area", "opacity": 0.1, "color": "#d94f2b" },
      "encoding": {
        "x": { "field": "year", "type": "ordinal" },
        "y": { "field": "revenue", "type": "quantitative" }
      }
    },
    {
      "transform": [ { "filter": "datum.type === 'actual'" } ],
      "mark": { "type": "line", "strokeWidth": 2.5, "color": "#d94f2b" },
      "encoding": {
        "x": { "field": "year", "type": "ordinal" },
        "y": { "field": "revenue", "type": "quantitative" },
        "tooltip": [
          { "field": "year", "title": "Year" },
          { "field": "revenue", "title": "Revenue (A$M)", "format": ",.0f" }
        ]
      }
    },
    {
      "transform": [ { "filter": "datum.type === 'forecast'" } ],
      "mark": { "type": "line", "strokeWidth": 2.5, "color": "#d94f2b", "strokeDash": [6, 3] },
      "encoding": {
        "x": { "field": "year", "type": "ordinal" },
        "y": { "field": "revenue", "type": "quantitative" },
        "tooltip": [
          { "field": "year", "title": "Year (Forecast)" },
          { "field": "revenue", "title": "Revenue (A$M)", "format": ",.0f" }
        ]
      }
    },
    {
      "transform": [ { "filter": "datum.year === '2020-21' && datum.type === 'actual'" } ],
      "mark": {
        "type": "text",
        "align": "right",
        "dx": -8,
        "dy": -12,
        "fontSize": 11,
        "color": "#7a7670"
      },
      "encoding": {
        "x": { "field": "year", "type": "ordinal" },
        "y": { "field": "revenue", "type": "quantitative" },
        "text": { "value": "COVID boom" }
      }
    }
  ],
  "encoding": {
    "x": {
      "field": "year",
      "type": "ordinal",
      "axis": { "title": null, "labelAngle": -45, "labelFontSize": 10 }
    },
    "y": {
      "field": "revenue",
      "type": "quantitative",
      "axis": { "title": "Revenue (A$ million)", "titleFontSize": 11 }
    }
  }
};

vegaEmbed("#chart3", chart3Spec, embedOpts);

// CHART 4: FAST FOOD VS DELIVERY STACKED BAR 
const chart4Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "height": 350,
  "data": { "url": "data/combined-revenue.json" },
  "mark": {
    "type": "bar",
    "cornerRadiusTopLeft": 3,
    "cornerRadiusTopRight": 3
  },
  "encoding": {
    "x": {
      "field": "year",
      "type": "ordinal",
      "axis": { "title": null, "labelAngle": -45, "labelFontSize": 10 }
    },
    "y": {
      "field": "revenue",
      "type": "quantitative",
      // stack: true means bars pile on top of each other per year
      "stack": true,
      "axis": { "title": "Revenue (A$ million)", "titleFontSize": 11 }
    },
    // color separates the two categories visually
    // fast food gets the accent red, delivery gets a lighter tone
    "color": {
      "field": "category",
      "scale": {
        "domain": ["Fast Food & Takeaway", "Online Delivery"],
        "range":  ["#1a3a5c", "#d94f2b"]
      },
      "legend": { "title": null, "orient": "top" }
    },
    "tooltip": [
      { "field": "year",     "title": "Year" },
      { "field": "category", "title": "Category" },
      { "field": "revenue",  "title": "Revenue (A$M)", "format": ",.0f" }
    ]
  }
};

vegaEmbed("#chart4", chart4Spec, embedOpts);

// MAP 2: PROPORTIONAL SYMBOL WORLD MAP 
const map2Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": "container",
  "height": 420,

  "title": {
  "text": "Where Australia Exports Its Health Food",
  "subtitle": "Proportional circles show export value in A$ million (2024)",
  "anchor": "start",
  "fontSize": 15,
  "subtitleFontSize": 11,
  "subtitleColor": "#7a7670",
  "fontWeight": "bold"},

  "projection": { "type": "naturalEarth1" },

  // naturalEarth1 is better than mercator for world maps 
  // doesn't distort countries near the poles 

  "layer": [

    // LAYER 1: base world map 
    {
      "data": {
        "url": "https://cdn.jsdelivr.net/npm/vega-datasets@2/data/world-110m.json",
        "format": { "type": "topojson", "feature": "countries" }
      },
      "mark": {
        "type": "geoshape",
        "fill": "#e8e2d9",
        "stroke": "#ffffff",
        "strokeWidth": 0.5
      }
    },

    // LAYER 2: proportional circles on each country
    {
      "data": { "url": "data/health-exports.json" },
      "mark": {
        "type": "circle",
        "opacity": 0.75,
        "color": "#2e8b57"
      },
      "encoding": {
        // longitude and latitude position the circles on the map
        "longitude": { "field": "lon", "type": "quantitative" },
        "latitude":  { "field": "lat", "type": "quantitative" },
        // size channel makes circles proportional to export value
        "size": {
          "field": "export",
          "type": "quantitative",
          "scale": { "range": [30, 1500] },
          "legend": { "title": "Export value (A$M)" }
        },
        "tooltip": [
          { "field": "country", "title": "Country" },
          { "field": "export",  "title": "Export value (A$M)", "format": ".1f" }
        ]
      }
    }
  ]
};

vegaEmbed("#map2", map2Spec, embedOpts);