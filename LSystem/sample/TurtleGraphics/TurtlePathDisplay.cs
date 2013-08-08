using System.Windows;
using System.Windows.Media;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TurtleGraphics
{
    public class TurtlePathDisplay : FrameworkElement
    {
        private VisualCollection children;
        private System.Timers.Timer timer = new System.Timers.Timer(100);

        public string Path
        {
            get { return (string)GetValue(PathProperty); }
            set { SetValue(PathProperty, value); }
        }

        public static readonly DependencyProperty PathProperty =
            DependencyProperty.Register(
            "Path", 
            typeof(string), 
            typeof(TurtlePathDisplay),
            new UIPropertyMetadata(string.Empty, new PropertyChangedCallback(OnDataChanged)));

        public TurtleParameters TurtleParameters
        {
            get { return (TurtleParameters)GetValue(TurtleParametersProperty); }
            set { SetValue(TurtleParametersProperty, value); }
        }
        
        public static readonly DependencyProperty TurtleParametersProperty =
            DependencyProperty.Register(
            "TurtleParameters", 
            typeof(TurtleParameters), 
            typeof(TurtlePathDisplay),
            new UIPropertyMetadata(new TurtleParameters(), new PropertyChangedCallback(OnDataChanged)));

        public TurtlePathDisplay()
        {
            this.children = new VisualCollection(this);
            var visual = new DrawingVisual();
            this.children.Add(visual);

            this.timer.Elapsed += new System.Timers.ElapsedEventHandler(OnTimerElapsed);
        }

        void OnTimerElapsed(object sender, System.Timers.ElapsedEventArgs e)
        {
            (sender as System.Timers.Timer).Stop();
            Dispatcher.BeginInvoke(new System.Threading.ThreadStart(delegate()
            { 
                this.UpdatePathGraphics(); 
            }));
        }

        protected override int VisualChildrenCount
        {
            get { return this.children.Count; }
        }

        protected override Visual GetVisualChild(int index)
        {
            if (index < 0 || index >= this.children.Count)
            {
                throw new ArgumentOutOfRangeException();
            }

            return this.children[index];
        }

        private static void OnDataChanged(DependencyObject obj, DependencyPropertyChangedEventArgs e)
        {
            // Data and path usually change together, so to prevent double update of
            // visual representation, update will be done on timer.
            System.Timers.Timer timer = (obj as TurtlePathDisplay).timer;
            if (!timer.Enabled)
            {
                timer.Start();
            }
        }

        private void UpdateTurtleParameters(ITurtle turtle, TurtleParameters parameters)
        {            
            turtle.Distance = parameters.Distance;
            turtle.TurnAngle = parameters.TurnAngle;
        }

        private void InitTurtleParameters(ITurtle turtle, TurtleParameters parameters)
        {
            UpdateTurtleParameters(turtle, parameters);
            turtle.Angle = parameters.StartAngle;            
        }

        private void MoveTurtle(ITurtle turtle)
        {
            TurtleParameters parameters = new TurtleParameters(TurtleParameters);

            InitTurtleParameters(turtle, parameters);

            var functions = new Dictionary<char, Action<ITurtle>>();
            functions['F'] = t => t.Forward(true); 
            functions['f'] = t => t.Forward(false); 
            functions['-'] = t => t.TurnLeft(); 
            functions['+'] = t => t.TurnRight(); 
            functions['['] = t => t.Push(); 
            functions[']'] = t => t.Pop(); 

            foreach (var c in this.Path)
            {
                Action<ITurtle> func;
                if (functions.TryGetValue(c, out func))
                {
                    func(turtle);

                    if (parameters.StepHandler != null)
                    {
                        parameters.StepHandler.Invoke(parameters);

                        UpdateTurtleParameters(turtle, parameters);
                    }
                }
            }
        }

        private void UpdatePathGraphics()
        {
            // Move measurement turtle along the way, let it detect the Bounds of the path.
            var measureTurtle = new MeasurementTurtle();
            this.MoveTurtle(measureTurtle);

            // Update own size and render transformation.
            this.Height = measureTurtle.Bounds.Height;
            this.Width = measureTurtle.Bounds.Width;

            this.RenderTransform = new TransformGroup()
            {
                Children = new TransformCollection()
                {
                    new TranslateTransform(-measureTurtle.Bounds.X, -measureTurtle.Bounds.Y),
                    new ScaleTransform(1, -1, 0, this.Height / 2)
                }
            };

            // Update geometry.
            using (var dc = (this.children[0] as DrawingVisual).RenderOpen())
            {
                if (this.TurtleParameters.StartThickness == this.TurtleParameters.EndThickness)
                {
                    this.MoveTurtle(new SimpleDrawingTurtle(
                        dc,
                        this.TurtleParameters.StartThickness,
                        this.TurtleParameters.UseRandomColors));
                }
                else
                {
                    using (var turtle = new DrawingTurtle(
                        dc,
                        measureTurtle.MaxLength,
                        this.TurtleParameters.StartThickness,
                        this.TurtleParameters.EndThickness,
                        this.TurtleParameters.UseRandomColors))
                    {
                        this.MoveTurtle(turtle);
                    }
                }
            }

            InvalidateVisual();
        }
    }
}
