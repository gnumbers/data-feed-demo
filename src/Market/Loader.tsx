import React from "react";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { render } from "react-dom";

interface LoaderProps {
  Stream: Observable<any>;
  Size?: number;
}

export default class extends React.Component<LoaderProps, { index: number }> {
  constructor(props: LoaderProps) {
    super(props);
    this.state = { index: 0 };
  }

  private subscription?: Subscription;

  private initialize = () => {
    if (this.subscription) this.subscription.unsubscribe();
    this.subscription = this.props.Stream.pipe(
      map((_: any, index: number) => index)
    ).subscribe(x => this.setState({ index: x }));
  };

  public componentDidMount = () => {
    this.initialize();
  };

  public componentDidUpdate = (prevProps: LoaderProps) => {
    if (
      prevProps.Size === this.props.Size &&
      prevProps.Stream === this.props.Stream
    )
      return;

    this.initialize();
  };

  public render = () => {
    let str = "";
    const size = this.props.Size || 10;
    for (let i = 0; i < size; i++)
      str += this.state.index % size == i ? "#" : "-";

    return (
      <div>
        <pre>
          {str} (total updates: {this.state.index})
        </pre>
      </div>
    );
  };
}
