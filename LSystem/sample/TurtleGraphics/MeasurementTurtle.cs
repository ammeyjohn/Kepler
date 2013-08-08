using System;
using System.Windows;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TurtleGraphics
{
    public class MeasurementTurtle : ITurtle
    {
        private Stack<Triad<Point, double, double>> branches = new Stack<Triad<Point, double, double>>();

        public MeasurementTurtle()
        {
            this.branches.Push(new Triad<Point, double, double>(new Point(0, 0), 0, 0));
        }

        public double MaxLength { get; protected set; }

        public Rect Bounds { get; protected set; }
        
        public double Distance { get; set; }
        
        public double TurnAngle { get; set; }
        
        public Point Position 
        {
            get 
            { 
                return this.branches.Peek().First; 
            }
 
            set 
            {
                this.branches.Peek().First = value;
                Rect b = this.Bounds;
                b.Union(value);
                this.Bounds = b;
            }
        }

        public double Angle 
        {
            get { return this.branches.Peek().Second; }
            set { this.branches.Peek().Second = value; } 
        }

        public double Length
        {
            get 
            { 
                return this.branches.Peek().Third; 
            }

            protected set 
            {
                this.branches.Peek().Third = value;
                this.MaxLength = Math.Max(this.MaxLength, value);
            }
        }        

        public virtual void Push()
        {
            this.branches.Push(new Triad<Point, double, double>(this.branches.Peek()));            
        }

        public virtual void Pop()
        {
            this.branches.Pop();
        }

        public virtual void Forward(bool doTrace)
        {
            Point pos = this.Position;

            pos.Offset(
                this.Distance * Math.Cos(this.Angle * Math.PI / 180.0),
                this.Distance * Math.Sin(this.Angle * Math.PI / 180.0));

            this.Position = pos;

            this.Length += this.Distance;
        }

        public virtual void TurnLeft()
        {
            this.Angle -= this.TurnAngle;
        }

        public virtual void TurnRight()
        {
            this.Angle += this.TurnAngle;
        }
    }
}
