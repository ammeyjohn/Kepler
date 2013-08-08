using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.CodeDom.Compiler;
using Microsoft.CSharp;
using System.Diagnostics;

namespace TurtleGraphics
{
    public class PathGenerator : BaseViewModel
    {
        private TurtleParameters turtleParameters = new TurtleParameters();
        private string parametersSourceCode;
        private string path = string.Empty;
        private bool hasError;
        private string errorText;

        public string ParametersSourceCode
        {
            get
            {
                return this.parametersSourceCode;
            }

            set
            {
                this.parametersSourceCode = value;
                NotifyPropertyChanged("ParametersSourceCode", false);
                this.InitPathGeneration();
            }
        }

        public TurtleParameters TurtleParameters
        {
            get
            {
                return this.turtleParameters;
            }

            set
            {
                this.turtleParameters = value;
                NotifyPropertyChanged("TurtleParameters", false);                
            }
        }

        public string Path
        {
            get
            {
                return this.path;
            }

            set
            {
                this.path = value;
                NotifyPropertyChanged("Path", false);
            }
        }

        public bool HasError
        {
            get
            {
                return this.hasError;
            }

            protected set
            {
                this.hasError = value;
                NotifyPropertyChanged("HasError", false);
            }
        }

        public string ErrorText
        {
            get
            {
                return this.errorText;
            }

            protected set
            {
                this.errorText = value;
                NotifyPropertyChanged("ErrorText", false);
            }
        }

        private void InitPathGeneration()
        {
            this.Build(this.ParametersSourceCode);
        }

        private void Build(string pathParameters)
        {
            // Initialize compiler options.
            CompilerParameters compilerParameters =
                new CompilerParameters()
                {
                    GenerateExecutable = true,
                    GenerateInMemory = true,
                    TreatWarningsAsErrors = true,
                    CompilerOptions = "/nowarn:1633"
                };

            // Add ourselves.
            compilerParameters.ReferencedAssemblies.Add(System.Reflection.Assembly.GetCallingAssembly().Location);

            // Specify .NET version.
            var providerOptions = new Dictionary<string, string>();
            providerOptions.Add("CompilerVersion", "v3.5");
            CSharpCodeProvider provider = new CSharpCodeProvider(providerOptions);

            string sourceFormat =
            @"
            using System;
            using TurtleGraphics;
            public class ParametersProvider
            {{    
                static void Main(string[] args){{}}
                public PathParameters Parameters
                {{
                    get
                    {{
                        return new PathParameters() {{ {0} }};
                    }}
                }}
            }}";

            string source = string.Format(sourceFormat, pathParameters);

            // Compile source.
            CompilerResults results =
                provider.CompileAssemblyFromSource(compilerParameters, new string[] { source });

            // Show errors.
            if (results.Errors.HasErrors)
            {
                this.HasError = true;
                StringBuilder sb = new StringBuilder();
                foreach (var err in results.Errors)
                {
                    sb.AppendLine(err.ToString());                    
                }

                this.ErrorText = sb.ToString();
                return;
            }
            else
            {
                this.HasError = false;
                this.ErrorText = string.Empty;
            }

            object obj = results.CompiledAssembly.CreateInstance("ParametersProvider");

            // Get the desired method by name.
            PropertyInfo propertyInfo = obj.GetType().GetProperty("Parameters");

            // Use the instance to call the property.
            PathParameters parameters = (PathParameters)propertyInfo.GetValue(obj, null);

            try
            {
                this.Build(parameters);
            }
            catch (InvalidOperationException ex)
            {
                this.HasError = true;
                this.ErrorText = ex.Message;
            }   
        }

        private void Build(PathParameters parameters) 
        {
            var rulesDict = new Dictionary<char, string>();
            if (parameters.Rules != null)
            {
                foreach (var s in parameters.Rules)
                {
                    if (s.Length < 3 || s[1] != ':')
                    {
                        throw new InvalidOperationException("Wrong rule text");
                    }

                    rulesDict.Add(s[0], s.Substring(2));
                }
            }

            var symbolsDict = new Dictionary<char, char>();
            if (parameters.Symbols != null)
            {
                foreach (var s in parameters.Symbols)
                {
                    if (s.Length != 3 || s[1] != ':')
                    {
                        throw new InvalidOperationException("Wrong symbols text");
                    }

                    symbolsDict.Add(s[0], s[2]);
                }
            }

            string path = parameters.Axiom;
            for (int i = 0; i < parameters.Level; ++i)
            {
                var newPath = new StringBuilder();
                foreach (var c in path)
                {
                    if (rulesDict.ContainsKey(c))
                    {
                        newPath.Append(rulesDict[c]);
                    }
                    else
                    {
                        newPath.Append(c);
                    }
                }

                path = newPath.ToString();
            }

            var translatedPath = new StringBuilder();
            foreach (var c in path)
            {
                if (symbolsDict.ContainsKey(c))
                {
                    translatedPath.Append(symbolsDict[c]);
                }
            }

            this.Path = translatedPath.ToString();
            this.TurtleParameters = parameters as TurtleParameters;
        }
    }
}
