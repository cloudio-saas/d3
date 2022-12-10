/* Copyright (c) 2020-present CloudIO Inc */

import { Theme } from '@mui/material';
import * as d3 from 'd3';

let counter = 0;

export function d3uid(name?: string) {
  return new Id(`O-${name ?? ''}-${++counter}`);
}

class Id {
  id: string;
  href: string;

  constructor(id: string) {
    this.id = id;
    // eslint-disable-next-line no-restricted-globals
    this.href = new URL(`#${id}`, location.toString()) + '';
  }

  toString = (): string => {
    return 'url(' + this.href + ')';
  };
}

export type TriggerCallback = (
  event: React.SyntheticEvent<HTMLOrSVGElement, Event>,
  extraProps: { record: Record<string, unknown> },
) => Promise<boolean>;

export interface D3Props {
  dataset: Record<string, unknown>[];
  platform: any;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
  itemId: string;
  appUid: string;
  pageId: string;
  onClickTrigger?: TriggerCallback;
  theme: Theme;
  rootRef: React.RefObject<HTMLDivElement>;
  tooltipRef: React.RefObject<HTMLDivElement>;
}
