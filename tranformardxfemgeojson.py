import ezdxf
import json
import os
from shapely.geometry import LineString, Polygon

def export_walls_and_areas(dxf_path, out_geojson, scale=20.0, piso_layers=None):
    if piso_layers is None:
        piso_layers = []
    if not os.path.exists(dxf_path):
        raise FileNotFoundError(dxf_path)

    doc = ezdxf.readfile(dxf_path)
    msp = doc.modelspace()

    features = []

    for e in msp:
        layer = getattr(e.dxf, "layer", "")
        try:
            t = e.dxftype()
        except Exception:
            continue

        if t in ("LINE", "LWPOLYLINE", "POLYLINE") and layer not in piso_layers:
            pts = []
            if t == "LINE":
                s = e.dxf.start; en = e.dxf.end
                pts = [[s[0]*scale, s[1]*scale], [en[0]*scale, en[1]*scale]]
            elif t == "LWPOLYLINE":
                pts = [[p[0]*scale, p[1]*scale] for p in e.get_points("xy")]
            else:
                pts = [[v.dxf.location[0]*scale, v.dxf.location[1]*scale] for v in e.vertices]

            if len(pts) >= 2:
                features.append({
                    "type":"Feature",
                    "geometry":{"type":"LineString","coordinates":pts},
                    "properties":{"type":"wall","layer":layer}
                })

        if t in ("LWPOLYLINE", "POLYLINE") and layer in piso_layers:
            closed = (t == "LWPOLYLINE" and getattr(e, "closed", False)) or \
                     (t == "POLYLINE" and getattr(e, "is_closed", False))
            if closed:
                if t == "LWPOLYLINE":
                    poly = [[p[0]*scale, p[1]*scale] for p in e.get_points("xy")]
                else:
                    poly = [[v.dxf.location[0]*scale, v.dxf.location[1]*scale] for v in e.vertices]
                if len(poly) >= 3:
                    features.append({
                        "type":"Feature",
                        "geometry":{"type":"Polygon","coordinates":[poly]},
                        "properties":{"type":"nav_area","layer":layer}
                    })

    geo = {"type":"FeatureCollection","features":features}
    with open(out_geojson, "w", encoding="utf-8") as f:
        json.dump(geo, f, indent=2, ensure_ascii=False)
    print("Salvo:", out_geojson)

if __name__ == "__main__":
    DXF = r"D:\novos mapas\HC 6 bebe.dxf"   
    OUT = "mapa_andar6.geojson"
    export_walls_and_areas(DXF, OUT, scale=15.0)