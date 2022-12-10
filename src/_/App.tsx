/* Copyright (c) 2020-present CloudIO Inc */

import { Box, Typography, useTheme } from '@mui/material';
import { D3Props, TriggerCallback } from 'cloudio';
import * as d3 from 'd3';
import React, { useCallback, useEffect, useRef } from 'react';
import { data } from './data';
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

  useEffect(() => {
    if (svgRef.current) {
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

      return () => {
        P.unmount(d3props);
      };
    }
  }, [appUid, height, itemId, pageId, theme, width]);

  useEffect(() => {
    if (svgRef.current && width && height) {
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
  }, [appUid, height, itemId, onClickTrigger, pageId, theme, width]);

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
        {Object.keys(record).length ? (
          <Typography color="#fff">
            Clicked Record: {JSON.stringify(record)}
          </Typography>
        ) : null}
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
