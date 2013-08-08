using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;

namespace TurtleGraphics
{
    public interface ITurtle
    {
        double Distance { get; set; }
        double TurnAngle { get; set; }

        Point Position { get; set; }
        double Angle { get; set; }

        void Push();
        void Pop();
        void Forward(bool doTrace);        
        void TurnLeft();
        void TurnRight();
    }
}
