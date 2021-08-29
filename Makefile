all: download proto

proto-gen-from-docker:
	docker build -t ts-protoc .
	docker run -v $(CURDIR):/workspace ts-protoc proto

proto:
	mkdir -p src/_library
	#sudo npm i -g ts-protoc-gen@0.15.0
	protoc ./ion/proto/ion/ion.proto -I./ion --plugin=protoc-gen-ts=/usr/local/bin/protoc-gen-ts --js_out=import_style=commonjs,binary:./src/_library --ts_out=service=grpc-web:./src/_library
	protoc ./ion/proto/rtc/rtc.proto -I./ion --plugin=protoc-gen-ts=/usr/local/bin/protoc-gen-ts --js_out=import_style=commonjs,binary:./src/_library --ts_out=service=grpc-web:./src/_library
	protoc ./ion/apps/room/proto/room.proto -I./ion --plugin=protoc-gen-ts=/usr/local/bin/protoc-gen-ts --js_out=import_style=commonjs,binary:./src/_library --ts_out=service=grpc-web:./src/_library

download:
	git clone https://github.com/pion/ion --depth=1

clean:
	rm -rf src/_library
