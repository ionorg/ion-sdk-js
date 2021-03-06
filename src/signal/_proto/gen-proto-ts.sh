#!/bin/sh

echo "Compiling proto file(s)..."

protoc /workspace/sfu.proto \
	--proto_path=/workspace \
    --plugin=protoc-gen-ts=/usr/bin/protoc-gen-ts \
    --js_out=import_style=commonjs,binary:/workspace/library/sfu \
    --ts_out=service=grpc-web:/workspace/library/sfu

protoc /workspace/ion.proto \
	--proto_path=/workspace \
    --plugin=protoc-gen-ts=/usr/bin/protoc-gen-ts \
    --js_out=import_style=commonjs,binary:/workspace/library/biz \
    --ts_out=service=grpc-web:/workspace/library/biz

protoc /workspace/biz.proto \
	--proto_path=/workspace \
    --plugin=protoc-gen-ts=/usr/bin/protoc-gen-ts \
    --js_out=import_style=commonjs,binary:/workspace/library/biz \
    --ts_out=service=grpc-web:/workspace/library/biz