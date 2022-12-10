/* Copyright (c) 2020-present CloudIO Inc */

import { parseISO } from 'date-fns';
import * as d3 from 'd3';
import { D3Props, d3uid } from 'cloudio';

const TOOLTIP_ON_TOP = true;

// mount function is called when the D3 Chart item is mounted
// do your initailization here. This function is called only once
// when the D3 Chart item is mounted. if the user navigates away
// from the page and comes back, this function will be called again
function mount(props: D3Props) {
  console.log('mount', props);
}

// render function is called whenever the props passed to the D3 Chart item changes
// e.g. when the dataset or the width or height of the D3 Chart item changes
function render(props: D3Props) {
  console.log('render', props);
  const {
    dataset, // this is the dataset passed to the D3 Chart item from the parent data store reference defined above the D3 Chart item
    svg, // this is the root svg element of the D3 Chart item
    width, // this is the width of the D3 Chart item
    height, // this is the height of the D3 Chart item
    onClickTrigger, // this is the callback function to invoke any On Click Triggers defined inside the D3 Chart item
    tooltipRef, // the tooltip div element
    rootRef, // the root div element
    theme, // the material-ui theme object
  } = props;
  // Accessors
  let xAccessor = (d: Record<string, any>) => parseISO(d.date);
  let yAccessor = (d: Record<string, any>) => d.temperature;

  // Dimensions
  let dimensions = {
    width,
    height: height,
    margins: 50,
    containerWidth: 0,
    containerHeight: 0,
  };

  dimensions.containerWidth = dimensions.width - dimensions.margins * 2;
  dimensions.containerHeight = dimensions.height - dimensions.margins * 2;

  const container = svg
    .append('g')
    .classed('container', true)
    .attr(
      'transform',
      `translate(${dimensions.margins}, ${dimensions.margins})`,
    );

  d3.select(tooltipRef.current).selectChild('.d3-tooltip').remove();

  const tooltip = d3
    .select(tooltipRef.current)
    .append('div')
    .style('display', 'none')
    .style('position', 'fixed')
    .attr('class', 'd3-tooltip')
    .style('background-color', '#444') // theme.palette.background.paper
    .style('border', 'solid')
    .style('z-index', '9999')
    .style('border-color', theme.palette.divider)
    .style('color', '#fff') // theme.palette.text.primary
    .style('border-width', '1px')
    .style('border-radius', '8px')
    .style('padding', '8px')
    .style('white-space', 'nowrap');
  let record: Record<string, unknown> | undefined = undefined;
  const tooltipDot = container
    .append('circle')
    .classed('tool-tip-dot', true)
    .attr('r', 8)
    .attr('fill', 'transparent')
    .attr('stroke', theme.palette.divider)
    .attr('stroke-width', 2)
    .style('opacity', 0)
    .style('cursor', 'pointer')
    .on('mouseenter', function () {
      tooltipDot.attr('stroke', theme.palette.primary.main);
    })
    .on('mouseleave', function () {
      tooltipDot.attr('stroke', theme.palette.divider);
    })
    .on('click', function (event) {
      if (record) {
        onClickTrigger?.(event, { record }); // this will invoke any On Click Triggers defined inside the D3 Chart item
      }
    });

  const vertical = container
    .append('line') // this is the black vertical line to follow mouse
    .attr('class', 'mouseLine')
    .attr('y1', dimensions.containerHeight)
    .attr('y2', 0)
    .style('stroke', theme.palette.divider)
    .style('stroke-width', '1px')
    .style('opacity', '0');

  const horizontal = container
    .append('line') // this is the black vertical line to follow mouse
    .attr('class', 'mouseLine')
    .attr('x1', 0)
    .attr('x2', dimensions.containerWidth)
    .style('stroke', theme.palette.divider)
    .style('stroke-width', '1px')
    .style('opacity', '0');

  const yDomain = d3.extent(dataset, yAccessor) as number[];
  const xDomain = d3.extent(dataset, xAccessor) as Date[];
  // Scales
  const yScale = d3
    .scaleLinear()
    .domain(yDomain)
    .nice()
    .range([dimensions.containerHeight, 0]);

  const xScale = d3
    .scaleUtc()
    .domain(xDomain)
    .range([0, dimensions.containerWidth]);

  const gradient = d3uid();

  const color = d3.scaleSequential(yScale.domain(), d3.interpolateTurbo);
  svg
    .append('linearGradient')
    .attr('id', gradient.id)
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', dimensions.containerHeight)
    .attr('x2', 0)
    .attr('y2', 0)
    .selectAll('stop')
    .data(d3.ticks(0, 1, 10))
    .join('stop')
    .attr('offset', (d) => d)
    .attr('stop-color', color.interpolator());

  // Line Generator
  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)));

  // Draw Line
  container
    .append('path')
    .datum(dataset)
    // @ts-ignore
    .attr('d', lineGenerator)
    .attr('fill', 'none')
    // @ts-ignore
    .attr('stroke', gradient)
    .attr('stroke-width', 2);

  // Axis
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${d} F`);

  const y = container
    .append('g')
    .style('color', theme.palette.divider)
    .classed('yAxis', true)
    .call(yAxis);
  y.selectAll('text').style('color', theme.palette.text.secondary);

  const xAxis = d3.axisBottom(xScale);

  const x = container
    .append('g')
    .style('color', theme.palette.divider)
    .classed('xAxis', true)
    .style('transform', `translateY(${dimensions.containerHeight}px)`)
    .call(xAxis);
  x.selectAll('text')
    .attr('transform', 'rotate(30)')
    .style('text-anchor', 'start')
    .style('color', theme.palette.text.secondary);

  // Tooltip
  const mouseTracker = container
    .append('rect')
    .classed('mouse-tracker', true)
    .attr('width', dimensions.containerWidth)
    .attr('height', dimensions.containerHeight)
    .style('opacity', 0)
    .on('touchmouse mousemove', function (event) {
      const mousePos = d3.pointer(event, this);
      // x coordinate stored in mousePos index 0
      const date = xScale.invert(mousePos[0]);
      // Custom Bisector - left, center, right
      const dateBisector = d3.bisector(xAccessor).center;
      const bisectionIndex = dateBisector(dataset, date);
      // math.max prevents negative index reference error
      record = dataset[Math.max(0, bisectionIndex)];
      const left = xScale(xAccessor(record));
      const top = yScale(yAccessor(record));
      // Update Image
      tooltipDot.style('opacity', 1).attr('cx', left).attr('cy', top).raise();

      const { top: mtop, left: mleft } = mouseTracker
        .node()!
        .getBoundingClientRect();
      const dateFormatter = d3.timeFormat('%B %-d, %Y');

      tooltip
        .style('display', 'block')
        .html(
          `${yAccessor(record)}&#8457; on ${dateFormatter(xAccessor(record))}`,
        )
        .style('top', `${(TOOLTIP_ON_TOP ? 0 : top) + mtop}px`)
        .style(
          'transform',
          `translate(-50%, ${
            TOOLTIP_ON_TOP ? 'calc(-100% - 8px)' : 'calc(-100% - 20px)'
          })`,
        )
        .style('left', `${left + mleft}px`);

      const {
        left: tl,
        top: tt,
        width: tw,
        height: th,
      } = tooltip.node()!.getBoundingClientRect()!;

      const ww = window.innerWidth;
      const wh = window.innerHeight;

      if (tl + tw > ww - 16) {
        tooltip
          .style('left', `${ww - tw - 16}px`)
          .style(
            'transform',
            `translate(0%, ${
              TOOLTIP_ON_TOP ? 'calc(-100% - 8px)' : 'calc(-100% - 20px)'
            })`,
          );
      }
      if (tl < 16) {
        tooltip
          .style('left', '16px')
          .style(
            'transform',
            `translate(0%, ${
              TOOLTIP_ON_TOP ? 'calc(-100% - 8px)' : 'calc(-100% - 20px)'
            })`,
          );
      }

      vertical.attr('x1', left).attr('x2', left).style('opacity', 1);
      horizontal
        .attr('y1', yScale(yAccessor(record)))
        .attr('y2', yScale(yAccessor(record)))
        .style('opacity', 1);
    });
  d3.select(rootRef.current).on('mouseleave', function () {
    vertical.style('opacity', 0);
    horizontal.style('opacity', 0);
    tooltipDot.style('opacity', 0);
    tooltip.style('display', 'none');
  });
}

// mount function is called when the D3 Chart item is unmounted
// use this to clean up any work done in the mount function
// this function will be called when the D3 Chart item is unmounted
// due to the user navigating away from the page or the D3 Chart item being removed from the dashboard
function unmount(props: D3Props) {
  console.log('unmount', props);
}

export default { render, mount, unmount };
