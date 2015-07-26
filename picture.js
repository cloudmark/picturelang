var Line = function Line() {
    function Line(startSegment, endSegment) {
        this.startSegment = startSegment;
        this.endSegment = endSegment;
    }

    Line.prototype.getStartSegment = function () {
        return this.startSegment;
    };

    Line.prototype.getEndSegment = function () {
        return this.endSegment;
    };

    return Line;
}();


var Vector2 = function Vector2() {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }

    Vector2.prototype.getX = function () {
        return this.x;
    };

    Vector2.prototype.getY = function () {
        return this.y;
    };

    Vector2.prototype.add = function (that) {
        return new Vector2(this.getX() + that.getX(), this.getY() + that.getY());
    };

    Vector2.prototype.scale = function (scalar) {
        return new Vector2(this.getX() * scalar, this.getY() * scalar);
    };

    Vector2.prototype.sub = function (that) {
        return new Vector2(this.getX() - that.getX(), this.getY() - that.getY());
    };

    return Vector2;
}();

var Frame = function Frame() {
    function Frame(ctx, origin, edge1, edge2) {
        this.ctx = ctx;
        this.origin = origin;
        this.edge1 = edge1;
        this.edge2 = edge2;
    }

    Frame.prototype.getOrigin = function () {
        return this.origin;
    };

    Frame.prototype.getEdge1 = function () {
        return this.edge1;
    };

    Frame.prototype.getEdge2 = function () {
        return this.edge2;
    };

    Frame.prototype.getContext = function () {
        return this.ctx;
    };

    return Frame;
}();

var Helpers = {
    generateFrameCoordinateMap: function (frame) {
        return function (v) {
            return frame.getOrigin()
                .add(frame.getEdge1().scale(v.getX()))
                .add(frame.getEdge2().scale(v.getY()))

        }
    }
};

function LinePainter(lines) {
    return function (frame) {
        var transform = Helpers.generateFrameCoordinateMap(frame);
        lines.forEach(function (l) {
            frame.ctx.beginPath();
            var tStart = transform(l.startSegment);
            var tEnd = transform(l.endSegment);
            frame.ctx.moveTo(tStart.getX(), frame.ctx.canvas.height - tStart.getY());
            frame.ctx.lineTo(tEnd.getX(), frame.ctx.canvas.height - tEnd.getY());
            frame.ctx.stroke();

        });
    }
}

function TransformPainter(painter, origin, corner1, corner2) {
    return function (frame) {
        var m = Helpers.generateFrameCoordinateMap(frame);
        var newOrigin = m(origin);
        var newCorner1 = m(corner1);
        var newCorner2 = m(corner2);
        var newFrame = new Frame(frame.ctx, newOrigin, newCorner1.sub(newOrigin), newCorner2.sub(newOrigin));
        painter(newFrame);
    }
}

function FlippedVert(painter) {
    return TransformPainter(
        painter,
        new Vector2(0.0, 1.0),
        new Vector2(1.0, 1.0),
        new Vector2(0.0, 0.0)
    );

}

function FlippedHorz(painter) {
    return TransformPainter(
        painter,
        new Vector2(1.0, 0.0),
        new Vector2(0.0, 0.0),
        new Vector2(1.0, 1.0)
    );

}


function ShrinkUpperRight(painter) {
    return TransformPainter(
        painter,
        new Vector2(0.5, 0.5),
        new Vector2(1.0, 0.5),
        new Vector2(0.5, 1.0)
    )
}

function Rotate90(painter) {
    return TransformPainter(
        painter,
        new Vector2(1.0, 0.0),
        new Vector2(1.0, 1.0),
        new Vector2(0.0, 0.0)
    )
}

function SquashInwards(painter) {
    return TransformPainter(
        painter,
        new Vector2(0.0, 0.0),
        new Vector2(0.65, 0.35),
        new Vector2(0.35, 0.65)
    )
}

function Besides(painter1, painter2) {
    var splitPoint = new Vector2(0.5, 0.0);
    var paintLeft = TransformPainter(painter1, new Vector2(0.0, 0.0), splitPoint, new Vector2(0.0, 1.0));
    var paintRight = TransformPainter(painter2, splitPoint, new Vector2(1.0, 0.0), new Vector2(0.5, 1.0));
    return function (frame) {
        paintLeft(frame);
        paintRight(frame);
    }
}

function Below(painter1, painter2) {
    var paintTop = TransformPainter(painter2, new Vector2(0.0, 0.5), new Vector2(1.0, 0.5), new Vector2(0.0, 1.0));
    var paintBottom = TransformPainter(painter1, new Vector2(0.0, 0.0), new Vector2(1.0, 0.0), new Vector2(0.0, 0.5));
    return function (frame) {
        paintTop(frame);
        paintBottom(frame);
    }
}

function Above(painter1, painter2) {
    return Below(painter2, painter1);
}

function FlippedPairs(painter) {
    var painter2 = Besides(painter, FlippedVert(painter));
    return Below(painter2, painter2);
}

function Wave() {
    var waveMan = [
        new Line(new Vector2(0.006, 0.840), new Vector2(0.155, 0.591)),
        new Line(new Vector2(0.006, 0.635), new Vector2(0.155, 0.392)),
        new Line(new Vector2(0.304, 0.646), new Vector2(0.155, 0.591)),
        new Line(new Vector2(0.298, 0.591), new Vector2(0.155, 0.392)),
        new Line(new Vector2(0.304, 0.646), new Vector2(0.403, 0.646)),
        new Line(new Vector2(0.298, 0.591), new Vector2(0.354, 0.492)),
        new Line(new Vector2(0.403, 0.646), new Vector2(0.348, 0.845)),
        new Line(new Vector2(0.354, 0.492), new Vector2(0.249, 0.000)),
        new Line(new Vector2(0.403, 0.000), new Vector2(0.502, 0.293)),
        new Line(new Vector2(0.502, 0.293), new Vector2(0.602, 0.000)),
        new Line(new Vector2(0.348, 0.845), new Vector2(0.403, 0.999)),
        new Line(new Vector2(0.602, 0.999), new Vector2(0.652, 0.845)),
        new Line(new Vector2(0.652, 0.845), new Vector2(0.602, 0.646)),
        new Line(new Vector2(0.602, 0.646), new Vector2(0.751, 0.646)),
        new Line(new Vector2(0.751, 0.646), new Vector2(0.999, 0.343)),
        new Line(new Vector2(0.751, 0.000), new Vector2(0.597, 0.442)),
        new Line(new Vector2(0.597, 0.442), new Vector2(0.999, 0.144)),
        new Line(new Vector2(0.395, 0.916), new Vector2(0.410, 0.916)),
        new Line(new Vector2(0.376, 0.746), new Vector2(0.460, 0.790))];

    return LinePainter(waveMan);
}

function RightSplit(painter, n) {
    if (n === 0) {
        return painter
    } else {
        var smaller = RightSplit(painter, n - 1);
        return Besides(painter, Below(smaller, smaller));
    }
}

function UpSplit(painter, n) {
    if (n === 0) {
        return painter
    } else {
        var smaller = UpSplit(painter, n - 1);
        return Above(Besides(smaller, smaller), painter);
    }
}

function CornerSplit(painter, n) {
    if (n == 0) {
        return painter;
    } else {

        // Create Top Left Corner
        var up = UpSplit(painter, n - 1);
        var topLeft = Besides(up, up);

        // Create Bottom Right
        var right = RightSplit(painter, n - 1);
        var bottomRight = Below(right, right);
        var corner = CornerSplit(painter, n - 1);

        return Besides(Below(painter, topLeft),
            Below(bottomRight, corner));
    }
}

function SquareLimit(painter, n){
    var quarter = CornerSplit(painter, n);
    var half = Besides(FlippedHorz(quarter), quarter);
    return Below(FlippedVert(half), half);
}






