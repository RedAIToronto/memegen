import React from 'react';



class ErrorBoundary extends React.Component {

  constructor(props) {

    super(props);

    this.state = { hasError: false };

  }



  static getDerivedStateFromError(error) {

    return { hasError: true };

  }



  componentDidCatch(error, errorInfo) {

    console.error('Error caught by boundary:', error, errorInfo);

  }



  render() {

    if (this.state.hasError) {

      return (

        <div className="p-4 text-center">

          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>

          <button

            className="text-blue-500 hover:underline"

            onClick={() => window.location.reload()}

          >

            Try Again

          </button>

        </div>

      );

    }



    return this.props.children;

  }

}



export default ErrorBoundary;


