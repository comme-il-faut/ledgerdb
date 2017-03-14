import {drag} from "d3-drag";
import {rgb} from "d3-color";
import {sankey} from "d3-sankey";
import {scaleOrdinal, schemeCategory20} from "d3-scale";
import {select, event as _event} from "d3-selection";

export default {
  drag,
  get event() { return _event; },
  rgb,
  sankey,
  scaleOrdinal,
  schemeCategory20,
  select
}
