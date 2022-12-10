/* Copyright (c) 2020-present CloudIO Inc */

import { Box, Typography, useTheme } from '@mui/material';
import { D3Props, TriggerCallback } from 'cloudio';
import * as d3 from 'd3';
import React, { useCallback, useEffect, useRef } from 'react';
import { data } from '../data';
import P from '../playground';

interface Props {
  width: number;
  height: number;
  itemId: string;
  appUid: string;
  pageId: string;
  onClickTrigger: TriggerCallback;
}

const dataset: Record<string, unknown>[] = data;

function IOD3Chart(props: Props, ref: React.Ref<HTMLDivElement>) {
  const { width, height, appUid, pageId, itemId, onClickTrigger } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const mounted = useRef(false);
  useEffect(() => {
    if (
      svgRef.current &&
      dataset.length &&
      width &&
      height &&
      !mounted.current
    ) {
      mounted.current = true;
      // Selections
      const svg = d3
        .select(svgRef.current)
        .classed('line-chart-svg', true)
        .attr('width', width)
        .attr('height', height);

      // clear all previous content on refresh
      const everything = svg.selectAll('*');
      everything.remove();
      const d3props: D3Props = {
        svg,
        dataset,
        width,
        height,
        theme,
        rootRef,
        tooltipRef,
        platform: {},
        itemId,
        pageId,
        appUid,
        onClickTrigger,
      };
      P.mount(d3props);
    }

    if (svgRef.current && mounted.current) {
      // Selections
      const svg = d3
        .select(svgRef.current)
        .classed('line-chart-svg', true)
        .attr('width', width)
        .attr('height', height);

      // clear all previous content on refresh
      const everything = svg.selectAll('*');
      everything.remove();

      if (dataset.length && width && height) {
        const d3props: D3Props = {
          svg,
          dataset,
          width,
          height,
          platform: {},
          itemId,
          pageId,
          appUid,
          onClickTrigger,
          theme,
          rootRef,
          tooltipRef,
        };

        P.render(d3props);
      }
    }
  }, [appUid, height, itemId, pageId, theme, width]);

  useEffect(() => {
    if (svgRef.current && dataset.length) {
      const svg = d3.select(svgRef.current);
      const d3props: D3Props = {
        svg,
        dataset: [],
        width: 0,
        height: 0,
        theme,
        rootRef,
        tooltipRef,
        platform: {},
        itemId,
        pageId,
        appUid,
        onClickTrigger,
      };
      return () => {
        P.unmount(d3props);
      };
    }
  }, [appUid, itemId, pageId, theme]);

  return (
    <Box ref={rootRef} sx={{ width, height, color: 'text.primary' }}>
      <svg ref={svgRef} />
      <div ref={tooltipRef}></div>
    </Box>
  );
}

export default function App() {
  const [record, setRecord] = React.useState<Record<string, unknown>>({});
  const [{ width, height }, setSize] = React.useState({
    width: window.innerWidth - 120,
    height: window.innerHeight - 120,
  });
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth - 120,
        height: window.innerHeight - 120,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onClickTrigger: TriggerCallback = useCallback(async (_, props) => {
    setRecord(props.record);
    return true;
  }, []);

  return (
    <div>
      <Box
        sx={{
          width: '100%',
          height: '60px',
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '60px',
        }}
      >
        <Typography color="#fff">
          {Object.keys(record).length
            ? `Clicked Record: ${JSON.stringify(record)}`
            : 'Click on a point to see the record'}
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          height: height,
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
        }}
      >
        <Box sx={{ width: '60px', height: height, bgcolor: 'primary.light' }} />
        <IOD3Chart
          width={width}
          height={height}
          itemId="x"
          pageId="x"
          appUid="x"
          onClickTrigger={onClickTrigger}
        />
        <Box sx={{ width: '60px', height: height, bgcolor: 'primary.light' }} />
      </Box>
      <Box sx={{ width: '100%', height: '60px', bgcolor: 'primary.light' }} />
    </div>
  );
}
