using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TurtleGraphics
{
    public class Triad<T, U, V>
    {
        public Triad()
        {
        }

        public Triad(T first, U second, V third)
        {
            this.First = first;
            this.Second = second;
            this.Third = third;
        }

        public Triad(Triad<T, U, V> t)
        {
            this.First = t.First;
            this.Second = t.Second;
            this.Third = t.Third;
        }

        public T First { get; set; }
        public U Second { get; set; }
        public V Third { get; set; }
    }
}
