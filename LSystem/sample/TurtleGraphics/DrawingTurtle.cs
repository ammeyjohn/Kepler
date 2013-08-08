using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Media;
using System.Windows;

namespace TurtleGraphics
{
    public class DrawingTurtle : MeasurementTurtle, IDisposable
    {
        private DrawingContext context;
        private double startThickness;
        private double endThickness;
        private double maxLength;
        private bool useRandomColors;
        private Stack<List<Pair<Point, bool>>> paths = new Stack<List<Pair<Point, bool>>>();

        public DrawingTurtle(DrawingContext context, double maxLength, double startWidth, double endWidth, bool useRandomColors)
        {
            this.context = context;            
            this.startThickness = startWidth;
            this.endThickness = endWidth;
            this.maxLength = maxLength;
            this.useRandomColors = useRandomColors;

            this.paths.Push(new List<Pair<Point, bool>>());
        }

        private Point StartPoint
        {
            get
            {
                var paths = this.paths.ToArray();
                for (int i = 0; i < paths.Length; ++i)
                {
                    if (paths[i].Count > 0)
                    {
                        return paths[i].Last().First;
                    }
                }

                return new Point(0, 0);
            }
        }

        public override void Forward(bool doTrace)
        {
            base.Forward(doTrace);

            this.paths.Peek().Add(new Pair<Point, bool>(Position, doTrace));
        }

        public override void Push()
        {
            base.Push();

            this.paths.Push(new List<Pair<Point, bool>>());
        }

        public override void Pop()
        {
            base.Pop();

            this.DrawPath(this.paths.Pop());
        }

        public void Dispose()
        {
            this.DrawPath(this.paths.Pop());
        }
        
        private void DrawPath(List<Pair<Point, bool>> list)
        {
            double pathLength = this.PathLength(list);
            double c = pathLength / this.maxLength;
            double length = 0;
            Point previousPoint = this.StartPoint;
            Brush brush = this.useRandomColors ? BrushRandom.Next() : Brushes.Black;
            foreach (var t in list)
            {
                length += (t.First - previousPoint).Length;

                if (t.Second)
                {
                    double lineThickness = 0;
                    if (this.startThickness >= this.endThickness)
                    {
                        lineThickness = this.endThickness + (this.startThickness - this.endThickness) * (pathLength - length) / pathLength * c;
                    }
                    else
                    {
                        lineThickness = this.startThickness + (this.endThickness - this.startThickness) * (length * c) / pathLength;
                    }

                    this.context.DrawLine(new Pen(brush, lineThickness), previousPoint, t.First);
                }

                previousPoint = t.First;
            }
        }

        private double PathLength(List<Pair<Point, bool>> list)
        {
            double length = 0;
            Point previousPoint = this.StartPoint;
            foreach (var t in list)
            {
                length += (t.First - previousPoint).Length;
                previousPoint = t.First;
            }

            return length;
        }
    }    
}
