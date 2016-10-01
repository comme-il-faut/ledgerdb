import React from 'react';

class Post extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    document.title = "LedgerDB - Post";
  }

  render() {
    return (
      <div>
        <h2>Post</h2>
      </div>
    );
  }
}

export default Post;

