using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Media;

namespace TurtleGraphics
{
    internal class BrushRandom
    {
        private static Random random = new Random();
        private static Brush[] brushes = new Brush[]
        {
            Brushes.Black,
            Brushes.Red,
            Brushes.Green,
            Brushes.Blue,
            Brushes.Magenta,
            Brushes.DarkGoldenrod,
            Brushes.DarkGray,
            Brushes.DarkOrange,
            Brushes.Violet,
            Brushes.YellowGreen,
            Brushes.Tomato,
            Brushes.Olive
        };

        public static Brush Next()
        {
            return brushes[random.Next(brushes.Length)];
        }
    }
}
