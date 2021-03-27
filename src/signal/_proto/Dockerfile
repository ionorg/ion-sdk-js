FROM mhart/alpine-node:12

RUN npm i -g ts-protoc-gen@0.14.0
RUN apk --no-cache add protobuf

WORKDIR /workspace

ENTRYPOINT /workspace/gen-proto-ts.sh
