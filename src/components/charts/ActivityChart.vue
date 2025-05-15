<template>
  <div class="activity-chart-container">
    <div ref="chartContainer" class="chart-area"></div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, watch, ref } from 'vue';
import * as d3 from 'd3';

export default {
  name: 'ActivityChart',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const chartContainer = ref(null);
    let chart = null;

    const drawChart = () => {
      if (!chartContainer.value || !props.data || props.data.length === 0) return;

      // Clear previous chart
      d3.select(chartContainer.value).selectAll('*').remove();

      // Set dimensions
      const margin = { top: 20, right: 30, bottom: 40, left: 50 };
      const width = chartContainer.value.clientWidth - margin.left - margin.right;
      const height = chartContainer.value.clientHeight - margin.top - margin.bottom;

      // Create SVG
      const svg = d3.select(chartContainer.value)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      // Format data
      const parseDate = d3.timeParse('%Y-%m-%d');
      const formattedData = props.data.map(d => ({
        date: parseDate(d.date),
        views: d.views,
        submissions: d.submissions,
        completions: d.completions
      }));

      // Set scales
      const x = d3.scaleTime()
          .domain(d3.extent(formattedData, d => d.date))
          .range([0, width]);

      const y = d3.scaleLinear()
          .domain([0, d3.max(formattedData, d => Math.max(d.views, d.submissions, d.completions)) * 1.1])
          .range([height, 0]);

      // Add X axis with Jalali date format
      const xAxis = svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x)
              .ticks(7)
              .tickFormat(date => {
                // Simple conversion of Gregorian to Jalali dates
                // In a real application, use a proper date conversion library
                const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
                const month = date.getMonth();
                const day = date.getDate();

                return `${day} ${persianMonths[month]}`;
              }));

      // Style X axis text
      xAxis.selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '.15em')
          .attr('transform', 'rotate(-45)');

      // Add Y axis
      svg.append('g')
          .call(d3.axisLeft(y));

      // Define line generators
      const viewsLine = d3.line()
          .x(d => x(d.date))
          .y(d => y(d.views))
          .curve(d3.curveMonotoneX);

      const submissionsLine = d3.line()
          .x(d => x(d.date))
          .y(d => y(d.submissions))
          .curve(d3.curveMonotoneX);

      const completionsLine = d3.line()
          .x(d => x(d.date))
          .y(d => y(d.completions))
          .curve(d3.curveMonotoneX);

      // Add the views line
      svg.append('path')
          .datum(formattedData)
          .attr('fill', 'none')
          .attr('stroke', '#4dabf7')
          .attr('stroke-width', 2)
          .attr('d', viewsLine);

      // Add the submissions line
      svg.append('path')
          .datum(formattedData)
          .attr('fill', 'none')
          .attr('stroke', '#ff922b')
          .attr('stroke-width', 2)
          .attr('d', submissionsLine);

      // Add the completions line
      svg.append('path')
          .datum(formattedData)
          .attr('fill', 'none')
          .attr('stroke', '#51cf66')
          .attr('stroke-width', 2)
          .attr('d', completionsLine);

      // Add legend
      const legend = svg.append('g')
          .attr('font-family', 'sans-serif')
          .attr('font-size', 10)
          .attr('text-anchor', 'end')
          .selectAll('g')
          .data([
            { label: 'بازدیدها', color: '#4dabf7' },
            { label: 'ارسال‌ها', color: '#ff922b' },
            { label: 'تکمیل‌ها', color: '#51cf66' }
          ])
          .enter().append('g')
          .attr('transform', (d, i) => `translate(0,${i * 20})`);

      legend.append('rect')
          .attr('x', width - 19)
          .attr('width', 19)
          .attr('height', 19)
          .attr('fill', d => d.color);

      legend.append('text')
          .attr('x', width - 24)
          .attr('y', 9.5)
          .attr('dy', '0.32em')
          .text(d => d.label);

      // Add points for each data point
      const addPoints = (data, color) => {
        svg.selectAll(`.point-${color}`)
            .data(formattedData)
            .enter().append('circle')
            .attr('class', `point-${color}`)
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d[data]))
            .attr('r', 4)
            .attr('fill', color)
            .attr('stroke', 'white')
            .attr('stroke-width', 2);
      };

      addPoints('views', '#4dabf7');
      addPoints('submissions', '#ff922b');
      addPoints('completions', '#51cf66');

      // Create tooltips
      const tooltip = d3.select(chartContainer.value)
          .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)
          .style('background-color', 'white')
          .style('border', '1px solid #ddd')
          .style('border-radius', '4px')
          .style('padding', '8px')
          .style('position', 'absolute')
          .style('pointer-events', 'none');

      // Add hover effect
      const addHoverEffect = (data, color) => {
        svg.selectAll(`.point-${color}`)
            .on('mouseover', (event, d) => {
              d3.select(event.currentTarget)
                  .transition()
                  .duration(100)
                  .attr('r', 6);

              tooltip.transition()
                  .duration(100)
                  .style('opacity', 1);

              tooltip.html(`
              <div style="font-weight: bold; margin-bottom: 5px;">${d.date.toLocaleDateString('fa-IR')}</div>
              <div>بازدیدها: ${d.views}</div>
              <div>ارسال‌ها: ${d.submissions}</div>
              <div>تکمیل‌ها: ${d.completions}</div>
            `)
                  .style('left', `${event.pageX + 10}px`)
                  .style('top', `${event.pageY - 30}px`);
            })
            .on('mouseout', (event) => {
              d3.select(event.currentTarget)
                  .transition()
                  .duration(100)
                  .attr('r', 4);

              tooltip.transition()
                  .duration(100)
                  .style('opacity', 0);
            });
      };

      addHoverEffect('views', '#4dabf7');
      addHoverEffect('submissions', '#ff922b');
      addHoverEffect('completions', '#51cf66');
    };

    // Draw chart when mounted
    onMounted(() => {
      drawChart();

      // Handle resize
      window.addEventListener('resize', drawChart);
    });

    // Cleanup
    onUnmounted(() => {
      window.removeEventListener('resize', drawChart);
    });

    // Watch for data changes
    watch(() => props.data, () => {
      drawChart();
    }, { deep: true });

    return { chartContainer };
  }
}
</script>

<style scoped>
.activity-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-area {
  width: 100%;
  height: 100%;
}

.tooltip {
  font-family: var(--font-family);
  font-size: 12px;
  direction: rtl;
  text-align: right;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
</style>