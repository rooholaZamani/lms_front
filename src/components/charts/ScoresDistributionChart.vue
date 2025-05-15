<template>
  <div class="scores-distribution-chart-container">
    <div ref="chartContainer" class="chart-area"></div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, watch, ref } from 'vue';
import * as d3 from 'd3';

export default {
  name: 'ScoresDistributionChart',
  props: {
    data: {
      type: Array,
      required: true,
      // Expected format: [{range: '0-10', count: 2}, {range: '11-20', count: 5}, ...]
    }
  },
  setup(props) {
    const chartContainer = ref(null);

    const drawChart = () => {
      if (!chartContainer.value || !props.data || props.data.length === 0) return;

      // Clear previous chart
      d3.select(chartContainer.value).selectAll('*').remove();

      // Set dimensions
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const width = chartContainer.value.clientWidth - margin.left - margin.right;
      const height = chartContainer.value.clientHeight - margin.top - margin.bottom;

      // Create SVG
      const svg = d3.select(chartContainer.value)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      // Set scales
      const x = d3.scaleBand()
          .domain(props.data.map(d => d.range))
          .range([0, width])
          .padding(0.1);

      const y = d3.scaleLinear()
          .domain([0, d3.max(props.data, d => d.count) * 1.1]) // 10% padding at top
          .range([height, 0]);

      // Add X axis
      svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x))
          .selectAll('text')
          .style('text-anchor', 'middle');

      // Add Y axis
      svg.append('g')
          .call(d3.axisLeft(y).ticks(5));

      // Add pass/fail divider line based on 60% (assuming 60 is passing score)
      const passIndex = props.data.findIndex(d => {
        const range = d.range.split('-');
        const min = parseInt(range[0]);
        return min >= 60;
      });

      if (passIndex > 0) {
        const passPosition = x(props.data[passIndex].range);

        svg.append('line')
            .attr('x1', passPosition)
            .attr('y1', 0)
            .attr('x2', passPosition)
            .attr('y2', height)
            .attr('stroke', '#dc3545')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5,5');

        svg.append('text')
            .attr('x', passPosition)
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#dc3545')
            .text('حد قبولی');
      }

      // Add bars
      svg.selectAll('.bar')
          .data(props.data)
          .enter().append('rect')
          .attr('class', 'bar')
          .attr('x', d => x(d.range))
          .attr('width', x.bandwidth())
          .attr('y', height) // Start from bottom for animation
          .attr('height', 0) // Start with height 0 for animation
          .attr('fill', d => {
            const range = d.range.split('-');
            const min = parseInt(range[0]);
            return min >= 60 ? '#20c997' : '#868e96';
          })
          .transition()
          .duration(1000)
          .attr('y', d => y(d.count))
          .attr('height', d => height - y(d.count));

      // Add labels on top of bars
      svg.selectAll('.label')
          .data(props.data)
          .enter().append('text')
          .attr('class', 'label')
          .attr('x', d => x(d.range) + x.bandwidth() / 2)
          .attr('y', d => y(d.count) - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('opacity', 0) // Start invisible for animation
          .text(d => d.count)
          .transition()
          .delay(1000) // Wait for bars to animate
          .duration(500)
          .style('opacity', 1);

      // Create tooltip
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
      svg.selectAll('.bar')
          .on('mouseover', (event, d) => {
            const range = d.range.split('-');
            const min = parseInt(range[0]);
            const max = parseInt(range[1]);

            tooltip.transition()
                .duration(100)
                .style('opacity', 1);

            tooltip.html(`
            <div style="font-weight: bold; margin-bottom: 5px;">نمرات ${d.range}</div>
            <div>تعداد: ${d.count} دانش‌آموز</div>
            <div>وضعیت: ${min >= 60 ? 'قبول' : 'رد'}</div>
          `)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 30}px`);

            d3.select(event.currentTarget)
                .transition()
                .duration(100)
                .attr('opacity', 0.8);
          })
          .on('mouseout', (event) => {
            tooltip.transition()
                .duration(100)
                .style('opacity', 0);

            d3.select(event.currentTarget)
                .transition()
                .duration(100)
                .attr('opacity', 1);
          });
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
.scores-distribution-chart-container {
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