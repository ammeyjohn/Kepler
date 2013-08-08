using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Media;
using System.Windows;

namespace TurtleGraphics
{
    public class SimpleDrawingTurtle : MeasurementTurtle
    {
        private DrawingContext context;
        private double lineThickness;
        private bool useRandomColors;

        public SimpleDrawingTurtle(DrawingContext context, double lineThickness, bool useRandomColors)
        {
            this.context = context;
            this.lineThickness = lineThickness;
            this.useRandomColors = useRandomColors;
        }

        public override void Forward(bool doTrace)
        {
            Point start = Position;

            base.Forward(doTrace);

            Point end = Position;

            if (doTrace)
            {
                this.context.DrawLine(
                    new Pen(this.useRandomColors ? BrushRandom.Next() : Brushes.Black, this.lineThickness),
                    start,
                    end);
            }
        }
    }
}
