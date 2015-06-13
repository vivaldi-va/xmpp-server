/**
 * Created by Zaccary on 13/06/2015.
 */


var xmpp = require('node-xmpp-server');
var Client = require('node-xmpp-client');
var ltx = require('node-xmpp-core').ltx;
var log = require('log4js').getLogger('xmpp-server')
var c2s = null;

var startServer = function(done) {
	c2s = new xmpp.C2SServer({
		port: 5222,
		domain: 'localhost'
	});

	c2s.on('connect', function(client) {
		client.on('register', function(opts, cb) {
			log.debug('register');
			cb(null, true);
		});

		client.on('authenticate', function(opts, cb) {
			log.debug('Auth ' + opts.jid + ' -> ' + opts.password);

			if('secret' === opts.password) {
				log.debug('auth success');
				return cb(null, opts);
			}
		});

		client.on('online', function() {
			log.debug('ONLINE')
		})

		// Stanza handling
		client.on('stanza', function(stanza) {
			log.debug('STANZA', stanza.root().toString());
			var from = stanza.attrs.from;
			stanza.attrs.from = stanza.attrs.to;
			stanza.attrs.to = from;
			client.send(stanza)
		});

		// On Disconnect event. When a client disconnects
		client.on('disconnect', function() {
			log.debug('DISCONNECT')
		});

	});

	if (done) done();


};

startServer(function() {
	var client2;
	var client1;

	client1 = new Client({
		jid: 'client1@localhost',
		password: 'secret'
	});

	client1.on('online', function(data) {
		log.debug('client1 is online');
		log.debug('client1', data);
		client1.send(new ltx.Element('message', { to: 'localhost' }).c('body').t('HelloWorld'))
	});

	client1.on('stanza', function(stanza) {
		log.debug('client1', 'received stanza', stanza.root().toString())
	});

	client2 = new Client({
		jid: 'client2@localhost',
		password: 'notsecret'
	});

	client2.on('error', function(error) {
		log.debug('client2 auth failed');
		log.debug('client2', error);
	});
});