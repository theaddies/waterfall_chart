const margin = { top: 100, right: 30, bottom: 100, left: 150 };
const width = 1200 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;
const padding = 0.3;
var ellipseOffset = 25;
var minYvalue = 100000000;

const x = d3
  .scaleBand()
  .rangeRound([ 0, width ])
  .padding(padding);

const y = d3
  .scaleLinear()
  .range([ height, 0 ]);

const xAxis = d3.axisBottom(x);

const yAxis = d3
  .axisLeft(y)
  .tickFormat((d) => {
    console.log("show tick format vlaue", d)
    d = Math.round(d/1000000)
    return d;
  });

const chart = d3
  .select('.chart')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${ margin.left },${ margin.top })`);

  chart.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top) + 30)
        .style("font-size", "x-large")
        .attr("text-anchor", "middle")  
       // .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Value vs Date Graph");

  chart.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .style("font-size", "x-large")
    .attr("y", -70)
    .attr("x", -height / 2 +30)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Sales (Millions €)");

const type = (d) => {
  d.value = +d.value;
  return d;
}; // type

function removeMillion(amount){
  return(`${Math.round(amount / 1000000)}`)
}

const eurFormat = (amount) => {
  if (Math.abs(amount) > 1000000) {
    return `${ Math.round(amount / 1000000) }M€`;
  }
  if (Math.abs(amount) > 1000) {
    return `${ Math.round(amount / 1000) }K€`;
  }
  return `${ amount }€`;
}; // eurFormat

const drawWaterfall = (data) => {
    console.log("waterfall_data", data)
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
  chart
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${ height })`)
    .call(xAxis)
    .selectAll('text')
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");;

  chart
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .selectAll('text')
    .classed('makebold', true);

  const bar = chart.selectAll('.bar')
    .data(data)
    .enter().append('g')
    .attr('class', (d) => {
      return `bar ${ d.class }`;
    })
    .attr('transform', (d) => {
      return `translate(${ x(d.name) },0)`;
    });

var rect = bar.append('g')

  rect
    .append('rect')
    .attr('y', (d) => {
      return y(Math.max(d.start, d.end));
    })
    .attr('height', (d) => {
      return Math.abs(y(d.start) - y(d.end));
    })
    .attr('width', x.bandwidth());

    var filterRect = rect
    .filter((d, i) => {
      // filter out first bar and total bars
      return (d.class !== 'total' && i !== 0);
    })

  // Add the value on each bar
  rect
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

  bar
    .filter((d, i) => {
      // filter out first bar and total bars
      return (d.class !== 'total' && i !== 0);
    })
    .append('ellipse')
    .attr('class', 'bubble')
    .attr('class', 'ellipse')
    .attr('cx', x.bandwidth() / 2)
    .attr('cy', (ellipseOffset - margin.top) / 2)
    .attr('rx', 30)
    .attr('ry', '1em');

  bar
    .filter((d, i) => {
      // filter out first bar and total bars
      return (d.class !== 'total' && i !== 0);
    })
    .append('text')
    .attr('x', x.bandwidth() / 2)
    .attr('y', (ellipseOffset - margin.top) / 2)
    .attr('dy', '.3em')
    .attr('class', 'bubble')
    .text((d) => {
      const percentage = d3.format('.1f')(((100 * (d.end - d.start)) / d.start));
      return `${ percentage }%`;
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
        .attr("class", "tooltip")
        //.style("top", d3.select(this).attr("y") + "px")
        //.style("top", "400px")
        //.style("position", "absolute")
        // .style(function(d) {
        //   console.log("********************************************************")
        //   var yValue = y(d.end);
        //   console.log("yValue***************************", yValue);
        //   return ("top", yValue + "px");
        // })

      // Step 2: Create the tooltip in chartGroup.
      filterRect.call(toolTip);

      // Step 3: Create "mouseover" event listener to display tooltip

      filterRect.on("mouseover", function(d) {
        // toolTip.transition()		
        // .duration(800)
        toolTip
        .style("opacity", .9);	
        console.log("d here", d)
        console.log("this", this)
        console.log("d.class !==", (d.class !== "total"))
        if (d.class !== "total") {
          console.log("just after the if statement************************************************", d)
          if(d.value > 0){
            bColor = "lime"
          }
          else {
            bColor = "tomato"
          }
          toolTip
 //       .style("opacity", 1)
//        .style("background", "green")
        .style("background" , bColor)
        .html(function(d) {
          console.log("at html")
          console.log("tooltip", toolTip)
          console.log("d within html", d)
          console.log("this within html", this)
          return (`<strong>Hi there<br>${d.name}</strong><br>${eurFormat(d.value)}<br><img src=${d.file} width = 30 height = 30>`);
        })

        .offset(function(d){
          console.log(y(d.value))
          console.log("test", Math.abs(y(d.start) - y(d.end)))
          yShift = Math.abs(y(d.start) - y(d.end))
          //values below are y, x
          return([yShift + 90, 0])
        });
        console.log("showing d", d);
        toolTip.show(d)
      d3.select(this)
      .classed("makebold", true)
        //.style("stroke", "black")
        .style("opacity", 1)
      }
      })
    
      // Step 4: Create "mouseout" event listener to hide tooltip
        .on("mouseout", function(d) {
          toolTip.hide(d);
          d3.select(this)
          .classed("makebold", false)
          .style("opacity", 1)
        });
}; // drawWaterfall

const prepData = (data) => {
  // create stacked remainder
  console.log("data =",data)
  const insertStackedRemainderAfter = (dataName, newDataName) => {
    const index = data.findIndex((datum) => {
        console.log("datum name",datum.name)
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
      console.log("datun",datum)
    datum.start = cumulative;
    cumulative += datum.value;
    //this reverses the order for the first bar so that it can also be a total.
    if(datum.start == 0) {
        datum.class = "total";
        datum.start = cumulative
        datum.end = minYvalue;
      }
    else if(datum.value >= 0){
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

