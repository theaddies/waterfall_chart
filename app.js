var svgWidth = 1800
var svgHeight = 1200

var margin = {
  top: 100,
  right: 40,
  bottom: 100,
  left: 100
};
var bColor = "gray"

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// this is the space between the bars
const padding = 0.4;
//the ellipse offset is the spacing down of the ellipses
var ellipseOffset = 25;
//this is the minimum value that will display on the y-axis
var minYvalue = 100000000;

// Append SVG element
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append group element
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

chartGroup.append("text")
  .attr("x", (width / 2))
  .attr("y", 0 - (margin.top) + 30)
  .style("font-size", "x-large")
  .attr("text-anchor", "middle")
  // .style("font-size", "16px") 
  .style("text-decoration", "underline")
  .text("Value vs Date Graph");

chartGroup.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .style("font-size", "x-large")
  .attr("y", -70)
  .attr("x", -height / 2 + 30)
  .attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("Sales (Millions €)");

const type = (d) => {
  d.value = +d.value;
  return d;
}; // type

function removeMillion(amount) {
  return (`${Math.round(amount / 1000000)}`)
}

function toolTipOffset(d){
  Math.abs(y(d.start) - y(d.end))
//values below are y, x
return ([yShift + 90, 0])

function tooltipColor(d) {
  if (d.value > 0) {
    bColor = "lime"
  }
  else {
    bColor = "tomato"
  }
  return (bColor)
}
}
  const eurFormat = (amount) => {
    if (Math.abs(amount) > 1000000) {
      return `${Math.round(amount / 1000000)}M€`;
    }
    if (Math.abs(amount) > 1000) {
      return `${Math.round(amount / 1000)}K€`;
    }
    return `${amount}€`;
  }; // eurFormat

  const drawWaterfall = (data) => {
    console.log("waterfall_data", data)


    const x = d3
      .scaleBand()
      .rangeRound([0, width])
      .padding(padding);

    const y = d3
      .scaleLinear()
      .range([height, 0]);

    const xAxis = d3.axisBottom(x);

    const yAxis = d3
      .axisLeft(y)
      .tickFormat((d) => {
        console.log("show tick format vlaue", d)
        d = Math.round(d / 1000000)
        return d;
      });


    x.domain(data.map((d) => {
      return d.name;
    }));

    y.domain([
      100000000,
      d3.max(data, (d) => {
        return Math.round(d.end);
      })
    ]);
    console.log("y-domain", y.domain)

    //add the x-axis
    chartGroup
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .classed("makebold", true)
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");;


    //add the y-axis
    chartGroup
      .append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .selectAll('text')
      .classed('makebold', true);

    //add a g with the bars with class so you can separate the bars total, positive, negative
    var bar = chartGroup.selectAll('.bar')
      .data(data)
      .enter().append('g')
      .attr('class', (d) => {
        return `bar ${d.class}`;
      })
      .attr('transform', (d) => {
        return `translate(${x(d.name)},0)`;
      })

    //var rect = bar.append('g')
    //here within each g added to bar we append a rect and set the values
    bar
      .append('rect')
      .attr('y', (d) => {
        return y(Math.max(d.start, d.end));
      })
      .attr('height', (d) => {
        return Math.abs(y(d.start) - y(d.end));
      })
      .attr('width', x.bandwidth())

    // Animation
    //note here that CharGroup works.  Using bar does not.
    //it also seems that selectAll('rect') is the right thing to choose
    chartGroup.selectAll('rect')
      .transition()
      .duration(2000)
      .attr("y", function (d) { console.log("d in delay", d); return y(Math.max(d.start, d.end)); })
      .attr("height", function (d) { return Math.abs(y(d.start) - y(d.end)); })
      .delay(function (d, i) { console.log("i here", i); return (10 * 100) })

    // Add the value on each bar
    bar
      .append('text')
      .attr('x', x.bandwidth() / 2)
      .attr('y', (d) => {
        return d.class === 'positive' ? y(d.end) : y(d.start);
      })
      .attr('dy', '-.2em')
      .text((d) => {
        return d.class === 'total' ? eurFormat(d.start - d.end + minYvalue) : eurFormat(d.end - d.start);
      })
      .style('fill', 'black');

    //filter out the first bar and the total classed bars.  they don't get ellipses.

    var filterBar = bar
      .filter((d, i) => {
        // filter out first bar and total bars
        return (d.class !== 'total' && i !== 0);
      })

    //add the ellipses
    filterBar
      .append('ellipse')
      .attr('class', 'bubble')
      .attr('class', 'ellipse')
      .attr('cx', x.bandwidth() / 2)
      .attr('cy', (ellipseOffset - margin.top) / 2)
      .attr('rx', 30)
      .attr('ry', '1em');

    //add the values within the ellipses
    filterBar
      .append('text')
      .attr('x', x.bandwidth() / 2)
      .attr('y', (ellipseOffset - margin.top) / 2)
      .attr('dy', '.3em')
      .attr('class', 'bubble')
      .text((d) => {
        const percentage = d3.format('.1f')(((100 * (d.end - d.start)) / d.start));
        return `${percentage}%`;
      });

    // Add the connecting line between each bar
    bar
      .filter((d, i) => {
        return i !== data.length - 1;
      })
      .append('line')
      .attr('class', 'connector')
      .attr('x1', x.bandwidth() + 5)
      .attr('y1', (d) => {
        console.log("y only start of line", y)
        console.log("y start of line", y(d.start))
        return d.class === 'total' ? y(d.start) : y(d.end);
      })
      .attr('x2', (x.bandwidth() / (1 - padding)) - 5)
      .attr('y2', (d) => {
        return d.class === 'total' ? y(d.start) : y(d.end);
      });

    // Step 1: Initialize Tooltip

    var toolTip = d3.tip()
      .attr('class', 'tooltip')
      //.offset([80, -60])
      .html(function (d) {
        return (`<strong>Hi there<br>${d.name}</strong><br>${eurFormat(d.value)}<br><img src=${d.file} width = 30 height = 30>`)
      })
      .offset(function(d) {

          // tooltipColor(d)
        yShift = Math.abs(y(d.start) - y(d.end))
        //values below are y, x
        return ([yShift + 90, 0])
      })
      
      .style("background", bColor)
 

      // Step 2: Create the tooltip in chartGroup.
      // REQUIRED:  Call the tooltip on the context of the visualization
      filterBar.call(toolTip);

      // Step 3: Create "mouseover" event listener to display tooltip
      // Show and hide the tooltip

      filterBar
        .on("mouseover", toolTip.show)


        // Step 4: Create "mouseout" event listener to hide tooltip
        .on("mouseout", toolTip.hide)
        //   d3.select(this)
        //     .classed("makebold", false)
        // });
    }; // drawWaterfall

    const prepData = (data) => {
      // create stacked remainder
      const insertStackedRemainderAfter = (dataName, newDataName) => {
        const index = data.findIndex((datum) => {
          return datum.name === dataName;
        }); // data.findIndex
        console.log("index", index)
        console.log("data[index].end", data[index].end)
        return data.splice(index + 1, 0, {
          name: newDataName,
          start: data[index].end,
          end: minYvalue,
          class: 'total',
        }); // data.splice
      }; // insertStackedRemainder

      // retrieve total value
      let cumulative = 0;

      // Transform data (i.e., finding cumulative values and total) for easier charting
      data.map((datum) => {
        console.log("datun", datum)
        datum.start = cumulative;
        cumulative += datum.value;
        //this reverses the order for the first bar so that it can also be a total.
        if (datum.start == 0) {
          datum.class = "total";
          datum.start = cumulative
          datum.end = minYvalue;
        }
        else if (datum.value >= 0) {
          datum.class = "positive"
          datum.end = cumulative;
        }
        else {
          datum.class = "negative"
          datum.end = cumulative;
        }
        //    return datum.class = datum.value >= 0 ? 'positive' : 'negative';
        return datum.class;
      }); // data.map

      // insert stacked remainders where approriate
      insertStackedRemainderAfter('customer6_2020', '2020Int');
      insertStackedRemainderAfter('customer6_2021', '2021B');

      return drawWaterfall(data);
    }; // prepData

    d3.csv('data.csv', type, (error, data) => {
      return prepData(data);
    });

