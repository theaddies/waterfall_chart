const margin = { top: 80, right: 30, bottom: 30, left: 100 };
const width = 1200 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;
const padding = 0.3;
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
    return d;
  });

const chart = d3
  .select('.chart')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${ margin.left },${ margin.top })`);

const type = (d) => {
  d.value = +d.value;
  return d;
}; // type

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
      return d.end;
    })
  ]);
    console.log("y-domain", y.domain)
  chart
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${ height })`)
    .call(xAxis);

  chart
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  const bar = chart.selectAll('.bar')
    .data(data)
    .enter().append('g')
    .attr('class', (d) => {
      return `bar ${ d.class }`;
    })
    .attr('transform', (d) => {
      return `translate(${ x(d.name) },0)`;
    });

  bar
    .append('rect')
    .attr('y', (d) => {
      return y(Math.max(d.start, d.end));
    })
    .attr('height', (d) => {
      return Math.abs(y(d.start) - y(d.end));
    })
    .attr('width', x.bandwidth());

  // Add the value on each bar
  bar
    .append('text')
    .attr('x', x.bandwidth() / 2)
    .attr('y', (d) => {
      return d.class === 'positive' ? y(d.end) : y(d.start);
    })
    .attr('dy', '-.5em')
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
    .attr('cy', (0 - margin.top) / 2)
    .attr('rx', 30)
    .attr('ry', '1em');

  bar
    .filter((d, i) => {
      // filter out first bar and total bars
      return (d.class !== 'total' && i !== 0);
    })
    .append('text')
    .attr('x', x.bandwidth() / 2)
    .attr('y', (0 - margin.top) / 2)
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
      chart.call(toolTip);

      // Step 3: Create "mouseover" event listener to display tooltip
      bar.on("mouseover", function(d) {
        console.log("d here", d)
        console.log("this", this)
        console.log("this.rect[0]", this.getElementsByTagName("rect")[0])
        console.log("this.rect[0].y", this.getElementsByTagName("rect")[0].y.animVal.value)
        var yDim = this.getElementsByTagName("rect")[0].y.animVal.value
        console.log("this.rect[0].outerHTML", this.getElementsByTagName("rect")[0].childNodes)
        toolTip
        .style("opacity", 1)
        .html(function(d) {
          console.log("at html")
          console.log("tooltip", toolTip)
          console.log("d within html", d)
          console.log("this within html", this)
          return (`<strong>Hi there<br>${d.name}<strong><hr>fd
          medal(s) won`);
        })
        .style("top", "800px")
        toolTip.show(d)
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
      })
      // Step 4: Create "mouseout" event listener to hide tooltip
        .on("mouseout", function(d) {
          toolTip.hide(d);
          d3.select(this)
          .style("stroke", "white")
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

