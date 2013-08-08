using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel;
using System.Windows.Input;
using System.Windows.Threading;

namespace TurtleGraphics
{   
    public class BaseViewModel : INotifyPropertyChanged
    {
        private Dispatcher dispatcher = Dispatcher.CurrentDispatcher;
        
        public event PropertyChangedEventHandler PropertyChanged;

        protected Dispatcher Dispatcher 
        { 
            get 
            { 
                return this.dispatcher; 
            } 
        }

        /// <summary>
        /// Notify of Property Changed event
        /// </summary>
        /// <param name="propertyName"></param>
        public void NotifyPropertyChanged(string propertyName, bool isCommandRelated)
        {
            if (this.PropertyChanged != null)
            {
                if (this.dispatcher != Dispatcher.CurrentDispatcher)
                {
                    throw new InvalidOperationException("Notification is called in the wrong thread.");
                }

                this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));

                if (isCommandRelated)
                {
                    CommandManager.InvalidateRequerySuggested();
                }
            }
        }        
    }    
}
