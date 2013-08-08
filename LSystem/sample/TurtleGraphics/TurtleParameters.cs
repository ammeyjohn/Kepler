using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TurtleGraphics
{
    public class TurtleParameters
    {
        public TurtleParameters()
        {
            this.Distance = 10;
            this.TurnAngle = 90;
            this.StartThickness = 1;
            this.EndThickness = 1;
        }

        public TurtleParameters(TurtleParameters parameters)
        {
            this.Distance  = parameters.Distance;
            this.TurnAngle = parameters.TurnAngle;
            this.StartAngle = parameters.StartAngle;
            this.StartThickness = parameters.StartThickness;
            this.EndThickness = parameters.EndThickness;
            this.UseRandomColors = parameters.UseRandomColors;
            this.StepHandler = parameters.StepHandler;
        }

        // Value to move forward.
        public double Distance { get; set; }

        // Turn angle (grads).
        public double TurnAngle { get; set; }

        // Start turtle angle (grads).
        public double StartAngle { get; set; }

        // Thickness of the first element.
        public double StartThickness { get; set; }

        // Thickness of the last element.
        public double EndThickness { get; set; }

        // If true, random colors will be used to draw lines.
        public bool UseRandomColors { get; set; }

        // Handler, which will be called after every turtle action.
        public Action<TurtleParameters> StepHandler { get; set; }
    }
}
