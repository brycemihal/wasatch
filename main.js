async function getSynopticData(meso_sites, startStr, endStr, k) {
    var junk = 'bb989856db719411';
    var meso_vars = ['air_temp', 'snow_depth', 'snow_water_equiv'];
    const response = await fetch('https://api.synopticdata.com/v2/stations/timeseries?stid=' + meso_sites + '&vars=' + meso_vars + '&start=' + startStr + '&end=' + endStr + '&obtimezone=local&token=' + k+junk);
    const data = await response.json();

    var sensor_var = Object.keys(data.STATION[0].OBSERVATIONS);
    // console.log(data)
    //  Plot Air Temperutre Data
    plotAirTemp(data, sensor_var, 1);
    plotSnowDepth(data, sensor_var, 2);
    // plotSnowDensity(data);
}


async function getNetRad(meso_sites, startStr, endStr, k) {
    var junk = 'bb989856db719411';
    var meso_vars = 'net_radiation';
    const response = await fetch('https://api.synopticdata.com/v2/stations/timeseries?stid=' + meso_sites + '&vars=' + meso_vars + '&start=' + startStr + '&end=' + endStr + '&obtimezone=local&token=' + k+junk);
    const data = await response.json();

    var sensor_var = Object.keys(data.STATION[0].OBSERVATIONS);

    plotNetRad(data);
}


function plotAirTemp(d, sensor_var, param) {

    // Loop for meso sites
    var plotData = [];
    // var hexColor = ['#003f5c', '#bc5090'];

    for (i in d.STATION) {
        var t = [];
        var n = (d.STATION[i].OBSERVATIONS.date_time).length;

        // create array for site name
        for (var j = 0; j < n; j++) {
            t.push(d.STATION[i].NAME);
        }

        // combine site data into array
        plotData[i] = {
            x: d.STATION[i].OBSERVATIONS.date_time,
            y: d.STATION[i].OBSERVATIONS[sensor_var[param]],
            type: "scatter",
            mode: "lines+markers",
            name: "",
            hovertemplate: '%{text}<br>' +
                '%{x}<br>' +
                '%{y}',
            text: t,//[d.STATION[i].NAME],
            marker: {
                // color: hexColor[i],
                size: 3
            },
            line: {
                // color: hexColor[i],
                width: 1
            }
        }
    }

    var layout = {
        hovermode: 'closest',
        // height: 800,
        // width: 400,
        // title: d.STATION[0].NAME,
        xaxis: {
            title: 'Datetime',
            linecolor: '#121F1F',
            mirror: false
        },
        yaxis: {
            title: 'Air Temp (C)',
            linecolor: '#121F1F'
        },
        margin: {
            l: 60,
            r: 0,
            b: 50,
            t: 0,
            pad: 10,
        },
        showlegend: false,
        dragmode: 'pan',
    };

    Plotly.newPlot('air_temp_set_1', plotData, layout, { scrollZoom: false });
}

function plotSnowDepth(d, sensor_var, param) {

    // Loop for meso sites
    var plotData = [];
    // var hexColor = ['#003f5c', '#bc5090'];

    for (i in d.STATION) {
        var t = [];
        var loc = [];
        var n = (d.STATION[i].OBSERVATIONS.date_time).length;
        var ydata = d.STATION[i].OBSERVATIONS[sensor_var[param]].map(function (x) { return x * .0393701 });
        ydata = ydata.map(function (x) { return Math.round(x) });

        // create array for site name
        for (var j = 0; j < n; j++) {
            t.push(d.STATION[i].NAME);

            if (ydata[j] > 100)
                ydata[j] = NaN;
            else if (ydata[j] == 0)
                ydata[j] = NaN;
        }

        // combine site data into array
        plotData[i] = {
            x: d.STATION[i].OBSERVATIONS.date_time,
            y: ydata, // mm to inches
            type: "scatter",
            mode: "lines+markers",
            name: "",
            hovertemplate: '%{text}<br>' +
                '%{x}<br>' +
                '%{y}',
            text: t,//[d.STATION[i].NAME],
            marker: {
                // color: hexColor[i],
                size: 3
            },
            line: {
                // color: hexColor[i],
                width: 1
            }
        }
    }

    var layout = {
        hovermode: 'closest',
        // height: 800,
        // width: 400,
        // title: d.STATION[0].NAME,
        xaxis: {
            title: 'Datetime',
            linecolor: '#121F1F',
            mirror: false
        },
        yaxis: {
            title: 'Snow Depth (in)',
            // domain: [0, 1],
            linecolor: '#121F1F'
        },
        margin: {
            l: 60,
            r: 0,
            b: 50,
            t: 0,
            pad: 10,
        },
        showlegend: false,
        dragmode: 'pan',
    };

    Plotly.newPlot('snow_depth_set_1', plotData, layout, { scrollZoom: false });
}

function plotSnowDensity(d) {

    // Loop for meso sites
    var ii = 0;
    var plotData = [];
    // var hexColor = ['#003f5c', '#bc5090'];

    for (i in d.STATION) {
        // console.log([d.STATION[i].NAME])
        if (!('snow_water_equiv_set_1' in d.STATION[i].OBSERVATIONS)) {
            continue;
        }

        var t = [];
        var loc = [];
        var n = (d.STATION[i].OBSERVATIONS.date_time).length;
        var snow_depth = d.STATION[i].OBSERVATIONS.snow_depth_set_1 // in mm
        var swe = d.STATION[i].OBSERVATIONS.snow_water_equiv_set_1 // mm

        var snow_density = swe.map(function (x, i) { return x / snow_depth[i] }); //unitless
        snow_density = snow_density.map(function (x) { return x * 1000 }); // kg/m3
        snow_density = snow_density.map(function (x) { return Math.round(x) });
        // console.log(snow_density)

        // create array for site name
        for (var j = 0; j < n; j++) {
            t.push(d.STATION[i].NAME);

            if (snow_density[j] < 50)
                snow_density[j] = NaN;
            else if (snow_density[j] == 0)
                snow_density[j] = NaN;
        }

        // combine site data into array
        plotData[ii] = {
            x: d.STATION[i].OBSERVATIONS.date_time,
            y: snow_density, // mm to inches
            type: "scatter",
            mode: "lines+markers",
            name: "",
            hovertemplate: '%{text}<br>' +
                '%{x}<br>' +
                '%{y}',
            text: t,//[d.STATION[i].NAME],
            marker: {
                // color: hexColor[i],
                size: 3
            },
            line: {
                // color: hexColor[i],
                width: 1
            }
        }
        ii++
    }

    var layout = {
        hovermode: 'closest',
        // height: 800,
        // width: 400,
        // title: d.STATION[0].NAME,
        xaxis: {
            title: 'Datetime',
            linecolor: '#121F1F',
            mirror: false
        },
        yaxis: {
            title: 'Snow Density (kg/m^3)',
            // domain: [0, 1],
            linecolor: '#121F1F'
        },
        margin: {
            l: 60,
            r: 0,
            b: 50,
            t: 0,
            pad: 10,
        },
        showlegend: false,
        dragmode: 'pan',
    };
    // console.log(plotData)
    Plotly.newPlot('snow_density', plotData, layout, { scrollZoom: false });
}

function plotNetRad(d) {

    // Loop for meso sites
    var plotData = [];
    // var hexColor = ['#003f5c', '#bc5090'];

    for (i in d.STATION) {
        var t = [];
        var n = (d.STATION[i].OBSERVATIONS.date_time).length;

        // create array for site name
        for (var j = 0; j < n; j++) {
            t.push(d.STATION[i].NAME);
        }

        // combine site data into array
        plotData[i] = {
            x: d.STATION[i].OBSERVATIONS.date_time,
            y: d.STATION[i].OBSERVATIONS.net_radiation_set_1,
            type: "scatter",
            mode: "lines+markers",
            name: "",
            hovertemplate: '%{text}<br>' +
                '%{x}<br>' +
                '%{y}',
            text: t,//[d.STATION[i].NAME],
            marker: {
                // color: hexColor[i],
                size: 3
            },
            line: {
                // color: hexColor[i],
                width: 1
            }
        }
    }

    var layout = {
        hovermode: 'closest',
        // height: 800,
        // width: 400,
        // title: d.STATION[0].NAME,
        xaxis: {
            title: 'Datetime',
            linecolor: '#121F1F',
            mirror: false
        },
        yaxis: {
            title: 'Net Radiation (W/m^2)',
            linecolor: '#121F1F'
        },
        margin: {
            l: 60,
            r: 0,
            b: 50,
            t: 0,
            pad: 10,
        },
        showlegend: false,
        dragmode: 'pan',
    };

    Plotly.newPlot('net_radiation_set_1', plotData, layout, { scrollZoom: false });
}



// function to convert to yyyy-mm-dd ////////////////////////////////////////
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        minute = '' + d.getMinutes(),
        hour = '' + d.getHours();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    if (minute.length < 2)
        minute = '0' + minute;
    if (hour.length < 2)
        hour = '0' + hour;

    return [year, month, day, hour, minute].join('');
}

// get date range
var numDays = 5; // number of days to plot
var d = new Date();
var endDate = new Date(d);
var startDate = new Date(d);
endDate.setDate(endDate.getDate() + 1)
startDate.setDate(startDate.getDate() - numDays)

// convert to yyyy-mm-dd
var endStr = [];
var startStr = [];
endStr = formatDate(endDate)
startStr = formatDate(startDate)

var k = 'd365a819ce5d418f';
// var meso_sites = ['TGLU1', 'UDDU1', 'FBNI1', 'LGS', 'TPKU1', 'KDNU1'];
var meso_sites = ['SBDU1','CLN','THCU1','BRIU1','MLDU1','PYSU1','TIMU1'];

getSynopticData(meso_sites, startStr, endStr, k)
    .catch(function () {
        console.error(error); // catch any errors            
    });

// var meso_sites = ['LRGCC', 'TYGRC', 'FRRBC'];
// getNetRad(meso_sites, startStr, endStr, k)
//     .catch(function () {
//         console.error(error); // catch any errors            
//     });