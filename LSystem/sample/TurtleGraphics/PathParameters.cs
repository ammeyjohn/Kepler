using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TurtleGraphics
{
    public class PathParameters : TurtleParameters
    {
        // List of rules - used to transform words.
        public string[] Rules { get; set; }

        // List of symbols - used to transform final word in the turtle command path.
        public string[] Symbols { get; set; }

        // Initial word.
        public string Axiom { get; set; }

        // Now many iteration shall be done.
        public int Level { get; set; }
    }
}
