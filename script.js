// script.js
// Load the CSV data and start the slideshow
let file = "world-gdp-gross-domestic-product.csv";
file = "http://localhost:8000/world-gdp-gross-domestic-product.csv"; // Required to run locally

const svg = d3.select("#chart-container");
const margin = { top: 20, right: 80, bottom: 50, left: 80 };
const width = svg.attr("width") - margin.left - margin.right;
const height = svg.attr("height") - margin.top - margin.bottom;

function setup() {
    d3.csv(file, function(d) {
        // Parse the data as needed (convert strings to numbers, dates, etc.)
        return {
            year: new Date(d["Date"]).getFullYear(),
            gdp: +d["GDP (Billions of US $)"],
            annualChange: +d["Annual % Change"]
        };
    }).then(function(data) {
        // Data loading is complete, proceed to rendering the chart
    
        // Create a new SVG group (g) to contain the chart elements
        const chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    
        // Set the ranges for the x and y axes
        const xScale = d3.scaleTime().domain(d3.extent(data, d => d.year)).range([0, width]);
        const yScaleGDP = d3.scaleLinear().domain([0, d3.max(data, d => d.gdp)]).range([height, 0]);
        const yScaleAnnualChange = d3.scaleLinear().domain(d3.extent(data, d => d.annualChange)).range([height, 0]);
    
        // Add x axis to the chart
        chartGroup.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
            .append("text")
                .style("font", "14px arial")
                .attr("x", width/2)
                .attr("y", margin.bottom - 15)
                .attr("fill", "black")
                .text("Year (yr.)");
    
        // Add left y axis to the chart for GDP
        chartGroup.append("g")
                .call(d3.axisLeft(yScaleGDP))
            .append("text")
                .style("font", "14px arial")
                .attr("x", height/2 + margin.bottom)
                .attr("y", margin.left - 20)
                .attr("transform", "rotate(90)")
                .attr("fill", "steelblue")
                .text("Global GDP (Billion USD)");
    
        // Add right y axis to the chart for Annual Change
        chartGroup.append("g")
                .attr("transform", `translate(${width}, 0)`)
                .call(d3.axisRight(yScaleAnnualChange))
            .append("text")
                .style("font", "14px arial")
                .attr("x", -1*(height/2 + margin.bottom))
                .attr("y", margin.right - 40)
                .attr("fill", "green")
                .attr("transform", "rotate(-90)")
                .text("Annual Change (%)");
        
        // Add annotation as tooltip
        let tooltip = d3.select("div#chart").select("div#annotation")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none");
        
        // Add the legend to the chart
        const legendItems = [
            { name: 'Global GDP (Bn. US$)', color: 'steelblue' },
            { name: 'Annual Change (%)', color: 'lightgreen' },
        ];
    
        const legend = chartGroup
            .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width - 190}, ${height - 65})`); // Position the legend in the top-right corner
    
        const legendRectSize = 18;
        const legendSpacing = 5;
    
        const legendItem = legend
            .selectAll('.legend-item')
            .data(legendItems)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * (legendRectSize + legendSpacing)})`);
        
        legendItem
            .append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .attr('fill', (d) => d.color);
    
        legendItem
            .append('text')
            .attr('x', legendRectSize + 5)
            .attr('y', legendRectSize - 5)
            .text(d => d.name)
            .style('font-size', '14px')
            .attr('alignment-baseline', 'middle');
    })
    .catch(function(error) {
        // Handle any error that may occur during data loading
        console.error("Error loading data:", error);
    });
}

function revealData(start, end) {
    d3.select("#chart-container").select('path#gdp').remove();
    d3.select("#chart-container").select('path#annualChange').remove();
    d3.csv(file, function(d) {
        // Parse the data as needed (convert strings to numbers, dates, etc.)
        return {
            year: new Date(d["Date"]).getFullYear(),
            gdp: +d["GDP (Billions of US $)"],
            annualChange: +d["Annual % Change"]
        };
    }).then(function(data) {
        // Data loading is complete, proceed to rendering the chart
    
        // Create a new SVG group (g) to contain the chart elements
        const chartGroup = svg.select("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    
        // Set the ranges for the x and y axes
        const xScale = d3.scaleTime().domain(d3.extent(data, d => d.year)).range([0, width]);
        const yScaleGDP = d3.scaleLinear().domain([0, d3.max(data, d => d.gdp)]).range([height, 0]);
        const yScaleAnnualChange = d3.scaleLinear().domain(d3.extent(data, d => d.annualChange)).range([height, 0]);

        // Create the line generators for GDP and Annual Change
        const lineGDP = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScaleGDP(d.gdp));
    
        const lineAnnualChange = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScaleAnnualChange(d.annualChange));
    
        // Add the line for Annual Change to the chart
        chartGroup.append("path")
            .datum(data.slice(0,end-start+1).concat(new Array(2021-end).fill(0)))
            .attr("id", "annualChange")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "lightgreen") // You can change the color of the line for Annual Change here
            .attr("stroke-width", 1.5)
            .attr("d", lineAnnualChange);
    
        // Add the line for GDP to the chart (GDP line is above Annual Change line)
        chartGroup.append("path")
            .datum(data.slice(0,end-start+1).concat(new Array(2021-end).fill(0)))
            .attr("id", "gdp")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", lineGDP);
        
        // Add event listeners to the SVG container (not individual paths)
        svg.on("click", function(event) {
            // const targetClass = d3.event.target.getAttribute("class");
            // if (targetClass === "line") {
            //     const hoveredLineId = d3.event.target.getAttribute("id");
            //     const lineData = (hoveredLineId === "gdp") ? data : data.slice(0, end - start + 1).concat(new Array(2021 - end).fill(0));

            //     // Show tooltip for the hovered line
            //     showTooltip(event, lineData);
            // }
            showTooltip(event, data);
        }).on("mouseout", hideTooltip);
    })
    .catch(function(error) {
        // Handle any error that may occur during data loading
        console.error("Error loading data:", error);
    });
}

function showTooltip(event, d) {
    const tooltip = d3.select("div#chart").select("div#annotation");
    tooltip.transition().duration(200).style("opacity", 0.9);

    xScaleLinear = d3.scaleLinear()
        .domain([margin.left, margin.left + width])
        .range([1960, 2021]);

    const mouseX = d3.event.pageX;
    const yearIndex = Math.round(xScaleLinear(mouseX)) - 1960;
    const datum = d[yearIndex];
    const tooltipContent = `Year: ${datum.year}<br>Global GDP: ${datum.gdp.toFixed(2)}<br>Annual Change: ${datum.annualChange.toFixed(2)}`;

    // Calculate tooltip position relative to the mouse cursor
    const tooltipX = mouseX + 10;
    const tooltipY = d3.event.pageY - 25;

    tooltip.html(tooltipContent)
        .style("left", tooltipX + "px")
        .style("top", tooltipY + "px");
}

function hideTooltip() {
    const tooltip = d3.select("div#chart").select("div#annotation");
    tooltip.transition().duration(300).style("opacity", 0);
}


